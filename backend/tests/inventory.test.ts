import request from 'supertest';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import app from '../src/app';
import { env } from '../src/config/env';
import { productRepository } from '../src/repositories/productRepository';
import { inventoryRepository } from '../src/repositories/inventoryRepository';
import { orderRepository } from '../src/repositories/orderRepository';
import { paymentRepository } from '../src/repositories/paymentRepository';

describe('Inventory Management & Atomic Concurrency Protection Tests', () => {
  let adminToken: string;
  let customerToken: string;
  const adminUserId = 'a1000000-0000-0000-0000-000000000001';
  const customerUserId = 'a1000000-0000-0000-0000-000000000004';
  let testProductId: string;

  beforeAll(async () => {
    adminToken = jwt.sign(
      { userId: adminUserId, email: 'admin@scanpaygo.com', role: 'ADMIN' },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    customerToken = jwt.sign(
      { userId: customerUserId, email: 'customer@scanpaygo.com', role: 'CUSTOMER' },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const product = await productRepository.findByBarcode('8901030000001');
    testProductId = product ? product.id : 'b1000000-0000-0000-0000-000000000001';
  });

  afterAll(async () => {
    try {
      const { pool } = require('../src/config/database');
      await pool.end();
    } catch (_) {}
  });

  describe('1. Admin Inventory Query, Search & Filters', () => {
    it('1.1 Should reject unauthenticated requests to /api/v1/inventory', async () => {
      const res = await request(app).get('/api/v1/inventory');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('1.2 Should reject customer role from accessing admin inventory endpoints', async () => {
      const res = await request(app)
        .get('/api/v1/inventory')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('1.3 Admin should list inventory items with stock status computed', async () => {
      const res = await request(app)
        .get('/api/v1/inventory')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      const firstItem = res.body.data[0];
      expect(firstItem.product_id).toBeDefined();
      expect(firstItem.quantity).toBeDefined();
      expect(firstItem.low_stock_threshold).toBeDefined();
      expect(['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK']).toContain(firstItem.stock_status);
    });

    it('1.4 Admin should search inventory by product name or barcode', async () => {
      const res = await request(app)
        .get('/api/v1/inventory?search=Amul')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].product_name).toContain('Amul');
    });

    it('1.5 Admin should fetch inventory KPI statistics', async () => {
      const res = await request(app)
        .get('/api/v1/inventory/stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(typeof res.body.data.totalProducts).toBe('number');
      expect(typeof res.body.data.inStockCount).toBe('number');
      expect(typeof res.body.data.lowStockCount).toBe('number');
      expect(typeof res.body.data.outOfStockCount).toBe('number');
      expect(typeof res.body.data.totalUnitsInStock).toBe('number');
    });
  });

  describe('2. Admin Stock Adjustments & Restocking', () => {
    it('2.1 Admin should update stock quantity and low stock threshold', async () => {
      const res = await request(app)
        .put(`/api/v1/inventory/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          quantity: 75,
          lowStockThreshold: 12,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.quantity).toBe(75);
      expect(res.body.data.low_stock_threshold).toBe(12);
      expect(res.body.data.stock_status).toBe('IN_STOCK');
    });

    it('2.2 Admin should trigger LOW_STOCK status when quantity <= threshold', async () => {
      const res = await request(app)
        .put(`/api/v1/inventory/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          quantity: 8,
          lowStockThreshold: 15,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.quantity).toBe(8);
      expect(res.body.data.stock_status).toBe('LOW_STOCK');
    });

    it('2.3 Admin should trigger OUT_OF_STOCK status when quantity = 0', async () => {
      const res = await request(app)
        .put(`/api/v1/inventory/${testProductId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          quantity: 0,
          lowStockThreshold: 15,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.quantity).toBe(0);
      expect(res.body.data.stock_status).toBe('OUT_OF_STOCK');
    });

    it('2.4 Admin should restock product and restore IN_STOCK status', async () => {
      const res = await request(app)
        .post(`/api/v1/inventory/${testProductId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 50 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.quantity).toBe(50);
      expect(res.body.data.stock_status).toBe('IN_STOCK');
    });
  });

  describe('3. Customer Cart Validation & Stock Availability', () => {
    it('3.1 Cart validation should reject items exceeding available stock', async () => {
      // Set stock to 5 units
      await inventoryRepository.updateStock(testProductId, { quantity: 5 });

      const res = await request(app)
        .post('/api/v1/checkout/validate-cart')
        .send({
          items: [
            {
              productId: testProductId,
              quantity: 10, // Exceeds 5
            },
          ],
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Insufficient stock');
    });
  });

  describe('4. Transaction-Safe Atomic Decrement & Concurrency Protection', () => {
    it('4.1 Stock should decrease atomically upon verified payment (Stock = 10, Customer buys 2 -> New stock = 8)', async () => {
      // Set exact initial stock to 10
      await inventoryRepository.updateStock(testProductId, { quantity: 10, lowStockThreshold: 5 });

      // Customer creates order for 2 units
      const testOrder = await orderRepository.createOrder({
        userId: customerUserId,
        totalAmount: 54.0,
        items: [
          {
            productId: testProductId,
            quantity: 2,
            priceAtPurchase: 27.0,
            subtotal: 54.0,
            productName: 'Amul Milk',
          },
        ],
      });

      const razorpayOrderId = `order_${Date.now()}_atomic1`;
      const razorpayPaymentId = `pay_${Date.now()}_atomic1`;

      await paymentRepository.createPayment({
        orderId: testOrder.id,
        razorpayOrderId,
        amount: testOrder.total_amount,
        status: 'CREATED',
      });

      const signature = crypto
        .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      // Verify payment (which executes atomic inventory decrement)
      const verifyRes = await request(app)
        .post('/api/v1/payments/verify-payment')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          orderId: testOrder.id,
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature: signature,
        });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.data.paymentStatus).toBe('PAID');

      // Verify stock was decremented from 10 to 8
      const inventory = await inventoryRepository.findByProductId(testProductId);
      expect(inventory?.quantity).toBe(8);
    });

    it('4.2 Concurrency / Negative Stock Prevention: Cannot deduct more than available stock', async () => {
      // Set stock to 2 units
      await inventoryRepository.updateStock(testProductId, { quantity: 2 });

      // Attempt to atomically deduct 5 units
      await expect(
        inventoryRepository.deductStockAtomically([{ productId: testProductId, quantity: 5 }])
      ).rejects.toThrow('Insufficient stock');

      // Ensure stock remained unchanged at 2 and NEVER became negative
      const inventory = await inventoryRepository.findByProductId(testProductId);
      expect(inventory?.quantity).toBe(2);
      expect(inventory!.quantity).toBeGreaterThanOrEqual(0);
    });
  });
});
