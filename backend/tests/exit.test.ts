import request from 'supertest';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import app from '../src/app';
import { env } from '../src/config/env';
import { orderRepository } from '../src/repositories/orderRepository';
import { paymentRepository } from '../src/repositories/paymentRepository';

describe('Exit Turnstile QR Verification Security Tests', () => {
  let adminToken: string;
  let customerToken: string;
  const adminUserId = 'a1000000-0000-0000-0000-000000000001';
  const customerUserId = 'a1000000-0000-0000-0000-000000000004';
  const sampleProductId = 'b1000000-0000-0000-0000-000000000001';

  beforeAll(async () => {
    // Admin Token (Turnstile scanner authority)
    adminToken = jwt.sign(
      { userId: adminUserId, email: 'admin@scanpaygo.com', role: 'ADMIN' },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Customer Token
    customerToken = jwt.sign(
      { userId: customerUserId, email: 'shopper@scanpaygo.com', role: 'CUSTOMER' },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    try {
      const { pool } = require('../src/config/database');
      await pool.end();
    } catch (_) {}
  });

  // Helper to create paid order with exit verification pass via verify-payment
  const createPaidOrderWithExitPass = async () => {
    const order = await orderRepository.createOrder({
      userId: customerUserId,
      totalAmount: 54.0,
      items: [
        {
          productId: sampleProductId,
          quantity: 2,
          priceAtPurchase: 27.0,
          subtotal: 54.0,
          productName: 'Amul Taaza Milk (500ml)',
        },
      ],
    });

    const razorpayOrderId = `order_exit_test_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const razorpayPaymentId = `pay_exit_test_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    await paymentRepository.createPayment({
      orderId: order.id,
      razorpayOrderId,
      amount: order.total_amount,
      status: 'CREATED',
    });

    const validSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    const verifyRes = await request(app)
      .post('/api/v1/payments/verify-payment')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        orderId: order.id,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature: validSignature,
      });

    return {
      order,
      exitToken: verifyRes.body.data.exitQrToken as string,
    };
  };

  describe('1. Access Control & Security Middleware', () => {
    it('1.1 Should reject unauthenticated exit verification attempts with 401', async () => {
      const res = await request(app)
        .post('/api/v1/exit-verification/verify')
        .send({ token: 'SPG-EXIT-ANY-TOKEN' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('1.2 Should reject customer role attempting to trigger turnstile scan with 403', async () => {
      const res = await request(app)
        .post('/api/v1/exit-verification/verify')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ token: 'SPG-EXIT-ANY-TOKEN' });

      expect(res.status).toBe(403);
      expect(res.body.message).toMatch(/Forbidden|Admin/i);
    });
  });

  describe('2. Authoritative Exit QR Verification Flow (POST /api/v1/exit-verification/verify)', () => {
    it('2.1 Should verify a valid paid order exit pass and return customer manifest', async () => {
      const { exitToken } = await createPaidOrderWithExitPass();

      const res = await request(app)
        .post('/api/v1/exit-verification/verify')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          token: exitToken,
          verifierNode: 'Gate Terminal #01',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.verificationStatus).toBe('VERIFIED');
      expect(res.body.data.totalAmount).toBe(54.0);
      expect(res.body.data.itemCount).toBe(2);
      expect(res.body.data.items).toHaveLength(1);
    });

    it('2.2 Single-Use Turnstile: Should reject already-verified exit token with 400', async () => {
      const { exitToken } = await createPaidOrderWithExitPass();

      // First verification -> Pass
      const firstRes = await request(app)
        .post('/api/v1/exit-verification/verify')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ token: exitToken });
      expect(firstRes.status).toBe(200);

      // Second verification attempt -> Rejected (Anti-Passback)
      const secondRes = await request(app)
        .post('/api/v1/exit-verification/verify')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ token: exitToken });

      expect(secondRes.status).toBe(400);
      expect(secondRes.body.success).toBe(false);
      expect(secondRes.body.message).toMatch(/already been verified/i);
    });

    it('2.3 Counterfeit Token: Should reject nonexistent or forged token with 404', async () => {
      const res = await request(app)
        .post('/api/v1/exit-verification/verify')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ token: 'SPG-EXIT-FORGED-99999-TAMPERED' });

      expect([400, 404]).toContain(res.status);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Invalid|counterfeit|not found/i);
    });

    it('2.4 Direct route alias: Should support POST /api/exit-verification/verify', async () => {
      const { exitToken } = await createPaidOrderWithExitPass();

      const res = await request(app)
        .post('/api/exit-verification/verify')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ token: exitToken });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('3. Exit Turnstile Audit Logs (GET /api/v1/exit-verification/logs)', () => {
    it('3.1 Should return recent turnstile logs for staff review', async () => {
      const res = await request(app)
        .get('/api/v1/exit-verification/logs?limit=5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });
});
