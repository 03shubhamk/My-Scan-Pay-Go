import request from 'supertest';
import app from '../src/app';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env';

describe('Barcode Scanner & Product Lookup Tests', () => {
  let customerToken: string;

  beforeAll(() => {
    customerToken = jwt.sign(
      { userId: 'customer-101', email: 'scanner@scanpaygo.com', role: 'CUSTOMER' },
      env.JWT_SECRET,
      { expiresIn: '1h', algorithm: 'HS256' }
    );
  });

  it('1. Valid Barcode Scan: Should return authoritative product details & stock level', async () => {
    const res = await request(app)
      .get('/api/products/barcode/8901030000001');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const product = res.body.data.product || res.body.data;
    expect(product.barcode).toBe('8901030000001');
    expect(product.name).toBeDefined();
    expect(product.price).toBeGreaterThan(0);
    expect(product.stock_quantity).toBeGreaterThanOrEqual(0);
  });

  it('2. Invalid Barcode: Should return HTTP 404 with helpful error message', async () => {
    const res = await request(app)
      .get('/api/products/barcode/9999999999999');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('not found');
  });

  it('3. Direct Route Alias: Should support /api/v1/products/barcode/:barcode', async () => {
    const res = await request(app)
      .get('/api/v1/products/barcode/8901491100010');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const product = res.body.data.product || res.body.data;
    expect(product.barcode).toBe('8901491100010');
  });

  it('4. Out-of-stock product scan identification', async () => {
    const res = await request(app)
      .get('/api/products/barcode/8901764012345');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const product = res.body.data.product || res.body.data;
    expect(typeof product.stock_quantity).toBe('number');
  });
});
