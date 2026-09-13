import request from 'supertest';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import app from '../src/app';
import { env } from '../src/config/env';
import { productRepository } from '../src/repositories/productRepository';
import { orderRepository } from '../src/repositories/orderRepository';
import { paymentRepository } from '../src/repositories/paymentRepository';

describe('Razorpay Payment Flow & Zero-Trust Verification Tests', () => {
  let authToken: string;
  let otherUserToken: string;
  const testUserId = 'a1000000-0000-0000-0000-000000000004';
  const otherUserId = 'a1000000-0000-0000-0000-000000000002';
  let sampleProductId: string;
  let sampleProductPrice: number;

  beforeAll(async () => {
    // Generate valid JWT tokens for tests
    authToken = jwt.sign(
      { userId: testUserId, email: 'shopper@scanpaygo.com', role: 'CUSTOMER' },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    otherUserToken = jwt.sign(
      { userId: otherUserId, email: 'other@scanpaygo.com', role: 'CUSTOMER' },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const product = await productRepository.findByBarcode('8901030000001');
    if (product) {
      sampleProductId = product.id;
      sampleProductPrice = Number(product.price);
    } else {
      sampleProductId = 'b1000000-0000-0000-0000-000000000001';
      sampleProductPrice = 27.0;
    }
  });

  afterAll(async () => {
    try {
      const { pool } = require('../src/config/database');
      await pool.end();
    } catch (_) {}
  });

  // Helper to create an order
  const createTestOrder = async () => {
    return await orderRepository.createOrder({
      userId: testUserId,
      totalAmount: sampleProductPrice * 2,
      items: [
        {
          productId: sampleProductId,
          quantity: 2,
          priceAtPurchase: sampleProductPrice,
          subtotal: sampleProductPrice * 2,
          productName: 'Amul Taaza Milk (500ml)',
        },
      ],
    });
  };

  describe('1. Create Razorpay Payment Order (POST /api/v1/checkout/create-payment-order)', () => {
    it('1.1 Should reject unauthenticated requests with HTTP 401', async () => {
      const res = await request(app)
        .post('/api/v1/checkout/create-payment-order')
        .send({ orderId: 'any-order-id' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('1.2 Should create Razorpay payment order and return ONLY public keyId (Secret Isolation)', async () => {
      const testOrder = await createTestOrder();

      const res = await request(app)
        .post('/api/v1/checkout/create-payment-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ orderId: testOrder.id });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.orderId).toBe(testOrder.id);
      expect(res.body.data.razorpayOrderId).toBeDefined();
      expect(res.body.data.amount).toBe(testOrder.total_amount);
      expect(res.body.data.amountInPaise).toBe(Math.round(testOrder.total_amount * 100));
      expect(res.body.data.currency).toBe('INR');
      expect(res.body.data.keyId).toBe(env.RAZORPAY_KEY_ID);

      // CRITICAL SECURITY ASSERTION: Razorpay secret must NEVER be exposed
      expect(res.body.data.keySecret).toBeUndefined();
      expect(res.body.data.secret).toBeUndefined();
      expect(JSON.stringify(res.body)).not.toContain(env.RAZORPAY_KEY_SECRET);
    });

    it('1.3 Should reject payment order creation if order belongs to another user', async () => {
      const testOrder = await createTestOrder();

      const res = await request(app)
        .post('/api/v1/checkout/create-payment-order')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({ orderId: testOrder.id });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('2. Payment Verification & Capture (POST /api/v1/payments/verify-payment)', () => {
    it('2.1 Successful payment: Valid HMAC signature updates order to PAID, generates Exit QR, and returns 200', async () => {
      const testOrder = await createTestOrder();
      const razorpayOrderId = `order_${Date.now()}_test1`;
      const razorpayPaymentId = `pay_${Date.now()}_test1`;

      // Save initial payment
      await paymentRepository.createPayment({
        orderId: testOrder.id,
        razorpayOrderId,
        amount: testOrder.total_amount,
        status: 'CREATED',
      });

      // Generate valid cryptographic signature using server secret
      const validSignature = crypto
        .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      const res = await request(app)
        .post('/api/v1/payments/verify-payment')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          orderId: testOrder.id,
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature: validSignature,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.orderId).toBe(testOrder.id);
      expect(res.body.data.paymentStatus).toBe('PAID');
      expect(res.body.data.razorpayPaymentId).toBe(razorpayPaymentId);
      expect(res.body.data.exitQrToken).toBeDefined();
      expect(res.body.data.exitQrToken).toContain('SPG-EXIT-');
      expect(res.body.data.order.payment_status).toBe('PAID');
      expect(res.body.data.order.status).toBe('COMPLETED');
    });

    it('2.2 Invalid verification: Tampered or invalid signature is rejected with HTTP 400', async () => {
      const testOrder = await createTestOrder();
      const razorpayOrderId = `order_${Date.now()}_test2`;
      const razorpayPaymentId = `pay_${Date.now()}_test2`;
      const tamperedSignature = 'fake_tampered_signature_hex_value_12345';

      await paymentRepository.createPayment({
        orderId: testOrder.id,
        razorpayOrderId,
        amount: testOrder.total_amount,
        status: 'CREATED',
      });

      const res = await request(app)
        .post('/api/v1/payments/verify-payment')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          orderId: testOrder.id,
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature: tamperedSignature,
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid payment signature');

      // Ensure order status was NOT marked as PAID
      const orderInDb = await orderRepository.findById(testOrder.id);
      expect(orderInDb?.payment_status).not.toBe('PAID');
    });

    it('2.3 Duplicate payment callback: Repeated verification is idempotent and returns existing verified state', async () => {
      const testOrder = await createTestOrder();
      const razorpayOrderId = `order_${Date.now()}_test3`;
      const razorpayPaymentId = `pay_${Date.now()}_test3`;

      const validSignature = crypto
        .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      // First verification call
      const res1 = await request(app)
        .post('/api/v1/payments/verify-payment')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          orderId: testOrder.id,
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature: validSignature,
        });

      expect(res1.status).toBe(200);
      expect(res1.body.data.paymentStatus).toBe('PAID');
      const firstExitToken = res1.body.data.exitQrToken;

      // Duplicate second verification call (e.g. network retry or webhook race condition)
      const res2 = await request(app)
        .post('/api/v1/payments/verify-payment')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          orderId: testOrder.id,
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature: validSignature,
        });

      expect(res2.status).toBe(200);
      expect(res2.body.success).toBe(true);
      expect(res2.body.data.paymentStatus).toBe('PAID');
      expect(res2.body.data.exitQrToken).toBe(firstExitToken);
    });

    it('2.4 Already paid order: Attempting to create new payment order on paid order is rejected', async () => {
      const testOrder = await createTestOrder();
      const razorpayOrderId = `order_${Date.now()}_test4`;
      const razorpayPaymentId = `pay_${Date.now()}_test4`;

      const validSignature = crypto
        .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      // Mark order as paid
      await request(app)
        .post('/api/v1/payments/verify-payment')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          orderId: testOrder.id,
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature: validSignature,
        });

      // Now attempt to initiate a new payment order for the same order
      const res = await request(app)
        .post('/api/v1/checkout/create-payment-order')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ orderId: testOrder.id });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already been paid');
    });

    it('2.5 Failed payment: Client reported or gateway failure records failure state', async () => {
      const testOrder = await createTestOrder();
      const razorpayPaymentId = `pay_${Date.now()}_failed`;

      const res = await request(app)
        .post('/api/v1/payments/failed')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          orderId: testOrder.id,
          razorpayPaymentId,
          reason: 'Payment cancelled by user at checkout',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const payment = await paymentRepository.findByOrderId(testOrder.id);
      expect(payment?.status).toBe('FAILED');
    });
  });
});
