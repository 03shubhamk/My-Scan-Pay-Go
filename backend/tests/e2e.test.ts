import request from 'supertest';
import crypto from 'crypto';
import app from '../src/app';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env';

describe('End-to-End Self-Checkout Flow (Full Customer & Admin Lifecycle)', () => {
  let customerToken: string;
  let adminToken: string;
  const customerEmail = `shopper_${Date.now()}@scanpaygo.com`;
  let scannedProduct: any;
  let createdOrderId: string;
  let razorpayOrderId: string;
  let exitQrToken: string;

  beforeAll(async () => {
    adminToken = jwt.sign(
      { userId: 'admin-e2e-01', email: 'admin@scanpaygo.com', role: 'ADMIN' },
      env.JWT_SECRET,
      { expiresIn: '1h', algorithm: 'HS256' }
    );
  });

  // Step 1: Customer Registration & Authentication
  it('Step 1: Customer registers and obtains secure JWT session', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Rohan Verma',
        email: customerEmail,
        password: 'SecurePassword123!',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    customerToken = res.body.data.token;
  });

  // Step 2: Barcode Scanner
  it('Step 2: Customer scans product barcode in store aisle', async () => {
    const res = await request(app)
      .get('/api/products/barcode/8901030000001')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    scannedProduct = res.body.data.product || res.body.data;
    expect(scannedProduct.name).toBeDefined();
    expect(Number(scannedProduct.price)).toBeGreaterThan(0);
  });

  // Step 3: Cart Validation
  it('Step 3: Cart validation computes authoritative subtotal & taxes', async () => {
    const unitPrice = Number(scannedProduct.price);
    const res = await request(app)
      .post('/api/checkout/validate-cart')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [
          {
            productId: scannedProduct.id,
            quantity: 2,
          },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.subtotalAmount).toBe(unitPrice * 2);
    expect(res.body.data.grandTotal).toBeGreaterThan(0);
  });

  // Step 4: Zero-Trust Order Creation
  it('Step 4: Customer creates order with backend Zero-Trust price validation', async () => {
    const unitPrice = Number(scannedProduct.price);
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [
          {
            productId: scannedProduct.id,
            quantity: 2,
            clientSpoofedPrice: 0.01, // Spoofed price ignored
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.status).toBe('PENDING');
    expect(res.body.data.payment_status).toBe('UNPAID');
    expect(res.body.data.total_amount).toBe(unitPrice * 2);
    createdOrderId = res.body.data.id;
  });

  // Step 5: Gateway Order Initialization
  it('Step 5: Initiates Razorpay payment gateway order', async () => {
    const unitPrice = Number(scannedProduct.price);
    const res = await request(app)
      .post('/api/checkout/create-payment-order')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        orderId: createdOrderId,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.razorpayOrderId).toBeDefined();
    expect(res.body.data.amount).toBe(unitPrice * 2);
    expect(res.body.data.keyId).toBeDefined();
    razorpayOrderId = res.body.data.razorpayOrderId;
  });

  // Step 6: Server-side Payment Verification & Exit QR Generation
  it('Step 6: Cryptographic HMAC signature verifies payment, updates order to PAID, and generates Exit QR', async () => {
    const mockPaymentId = `pay_${Date.now()}_e2e`;
    const validSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${mockPaymentId}`)
      .digest('hex');

    const res = await request(app)
      .post('/api/payments/verify-payment')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        orderId: createdOrderId,
        razorpayOrderId: razorpayOrderId,
        razorpayPaymentId: mockPaymentId,
        razorpaySignature: validSignature,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.paymentStatus).toBe('PAID');
    expect(res.body.data.exitQrToken).toBeDefined();
    expect(res.body.data.exitQrToken).toContain('SPG-EXIT');
    exitQrToken = res.body.data.exitQrToken;
  });

  // Step 7: Receipt & Order Details
  it('Step 7: Customer fetches detailed digital receipt', async () => {
    const res = await request(app)
      .get(`/api/orders/${createdOrderId}`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.payment_status).toBe('PAID');
    expect(res.body.data.items).toHaveLength(1);
  });

  // Step 8: Customer Exit QR Pass Status
  it('Step 8: Customer retrieves active Exit QR turnstile clearance token', async () => {
    const res = await request(app)
      .get(`/api/exit-verification/status/${createdOrderId}`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBe(exitQrToken);
  });

  // Step 9: Store Turnstile Staff / Hardware Gate Scan & Verification
  it('Step 9: Turnstile gate scans Exit QR pass and grants clearance', async () => {
    const res = await request(app)
      .post('/api/exit-verification/verify')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        token: exitQrToken,
        verifierNode: 'Express Self-Checkout Turnstile #01',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('Gate unlocked');
  });

  // Step 10: Anti-Replay / Single-Use Enforcement
  it('Step 10: Re-scanning already verified Exit QR pass is strictly rejected (Anti-Theft)', async () => {
    const res = await request(app)
      .post('/api/exit-verification/verify')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        token: exitQrToken,
        verifierNode: 'Express Self-Checkout Turnstile #01',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('already been verified');
  });
});
