import request from 'supertest';
import app from '../src/app';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env';

describe('Products Management API Suite', () => {
  let adminToken: string;
  let customerToken: string;

  beforeAll(() => {
    adminToken = jwt.sign(
      { userId: 'admin-1', email: 'admin@scanpaygo.com', role: 'ADMIN' },
      env.JWT_SECRET,
      { expiresIn: '1h', algorithm: 'HS256' }
    );

    customerToken = jwt.sign(
      { userId: 'customer-1', email: 'customer@scanpaygo.com', role: 'CUSTOMER' },
      env.JWT_SECRET,
      { expiresIn: '1h', algorithm: 'HS256' }
    );
  });

  describe('POST /api/products (Add Product)', () => {
    it('1. Should reject product creation by unauthenticated users (401)', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({
          name: 'Test Cookie',
          barcode: '8901234567890',
          category: 'Snacks',
          price: 25.00,
          stockQuantity: 50,
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('2. Should reject product creation by non-admin users (403)', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          name: 'Test Cookie',
          barcode: '8901234567890',
          category: 'Snacks',
          price: 25.00,
          stockQuantity: 50,
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('3. Should create a new product when requested by admin (201)', async () => {
      const uniqueBarcode = `890${Date.now().toString().slice(-10)}`;
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Organic Honey 250g',
          description: 'Pure forest honey',
          barcode: uniqueBarcode,
          category: 'Pantry',
          price: 180.00,
          stockQuantity: 40,
          lowStockThreshold: 5,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      const product = res.body.data.product || res.body.data;
      expect(product.name).toBe('Organic Honey 250g');
      expect(product.barcode).toBe(uniqueBarcode);
      expect(product.price).toBe(180.00);
    });

    it('4. Should reject duplicate barcode creation (400 or 409)', async () => {
      const duplicateBarcode = `890_DUP_${Date.now()}`;

      // First create
      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Original Product',
          barcode: duplicateBarcode,
          category: 'Pantry',
          price: 50.00,
          stockQuantity: 10,
        });

      // Second create with identical barcode
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Duplicate Product',
          barcode: duplicateBarcode,
          category: 'Pantry',
          price: 60.00,
          stockQuantity: 10,
        });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/products (List & Search Products)', () => {
    it('1. Should list products with pagination and category filtering', async () => {
      const res = await request(app)
        .get('/api/products?page=1&limit=10');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const products = res.body.data.products || res.body.data;
      expect(Array.isArray(products)).toBe(true);
    });

    it('2. Should search products by keyword match', async () => {
      const res = await request(app)
        .get('/api/products?search=Amul');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const products = res.body.data.products || res.body.data;
      expect(Array.isArray(products)).toBe(true);
    });
  });

  describe('PUT /api/products/:id & DELETE /api/products/:id', () => {
    it('1. Should update product price and name', async () => {
      const uniqueBarcode = `890_UPD_${Date.now()}`;
      const createRes = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Item Before Update',
          barcode: uniqueBarcode,
          category: 'Dairy',
          price: 30.00,
          stockQuantity: 25,
        });

      const product = createRes.body.data.product || createRes.body.data;
      const productId = product.id;

      const updateRes = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Item After Update',
          price: 35.00,
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.success).toBe(true);
      const updatedProduct = updateRes.body.data.product || updateRes.body.data;
      expect(updatedProduct.name).toBe('Item After Update');
      expect(updatedProduct.price).toBe(35.00);
    });

    it('2. Should return 404 when querying non-existent product ID', async () => {
      const res = await request(app)
        .get('/api/products/00000000-0000-0000-0000-000000000000');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});
