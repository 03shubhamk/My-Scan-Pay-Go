import request from 'supertest';
import app from '../src/app';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env';
import { productRepository } from '../src/repositories/productRepository';

describe('Order Creation & Management API Endpoints', () => {
  let authToken: string;
  const testUserId = 'u0000000-0000-0000-0000-000000000001';
  let sampleProductId: string;

  beforeAll(async () => {
    // Generate valid JWT token for test user
    authToken = jwt.sign(
      { userId: testUserId, email: 'testcustomer@scanpaygo.com', role: 'CUSTOMER' },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Fetch sample product from repository
    const sampleProduct = await productRepository.findByBarcode('8901030000001');
    if (sampleProduct) {
      sampleProductId = sampleProduct.id;
    } else {
      sampleProductId = 'p1000000-0000-0000-0000-000000000001';
    }
  });

  describe('POST /api/orders (Order Creation)', () => {
    it('1. Should reject unauthenticated requests with HTTP 401', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({ items: [{ productId: sampleProductId, quantity: 1 }] });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('2. Should create order and recalculate total using authoritative DB prices (Zero-Trust)', async () => {
      const product = await productRepository.findById(sampleProductId);
      const expectedDbPrice = product ? Number(product.price) : 27.00;
      const requestedQty = 2;
      const expectedTotal = expectedDbPrice * requestedQty;

      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [
            {
              productId: sampleProductId,
              quantity: requestedQty,
              clientSpoofedPrice: 0.01, // Spoofed price ignored by backend
              clientSpoofedTotal: 0.02,
            },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.total_amount).toBe(expectedTotal);
      expect(res.body.data.status).toBe('PENDING');
      expect(res.body.data.payment_status).toBe('UNPAID');
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].product_id).toBe(sampleProductId);
      expect(res.body.data.items[0].quantity).toBe(requestedQty);
      expect(res.body.data.items[0].price_at_purchase).toBe(expectedDbPrice);
      expect(res.body.data.items[0].subtotal).toBe(expectedTotal);
    });

    it('3. Should reject order creation when requested quantity exceeds available stock', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [
            {
              productId: sampleProductId,
              quantity: 999999, // Exceeds stock limit
            },
          ],
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Insufficient stock');
    });

    it('4. Should reject order creation if product ID is invalid or non-existent', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [
            {
              productId: '00000000-0000-0000-0000-000000000000',
              quantity: 1,
            },
          ],
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Product not found');
    });

    it('5. Should reject empty items array or invalid request format', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ items: [] });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/orders (Order List)', () => {
    it('1. Should return list of orders created by the authenticated user', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/orders/:id (Order Details)', () => {
    it('1. Should fetch full order details by ID', async () => {
      // First create an order
      const createRes = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [{ productId: sampleProductId, quantity: 1 }],
        });

      const orderId = createRes.body.data.id;

      // Fetch by ID
      const res = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(orderId);
      expect(res.body.data.items).toHaveLength(1);
    });

    it('2. Should return 404 for non-existent order ID', async () => {
      const res = await request(app)
        .get('/api/orders/non-existent-order-id-12345')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
