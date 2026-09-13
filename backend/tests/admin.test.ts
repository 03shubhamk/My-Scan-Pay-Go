import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app';
import { env } from '../src/config/env';

describe('Admin Dashboard Authoritative Analytics & RBAC Tests', () => {
  let adminToken: string;
  let customerToken: string;
  const adminUserId = 'a1000000-0000-0000-0000-000000000001';
  const customerUserId = 'a1000000-0000-0000-0000-000000000004';

  beforeAll(() => {
    adminToken = jwt.sign(
      { userId: adminUserId, email: 'admin@scanpaygo.com', role: 'ADMIN' },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    );

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

  describe('1. RBAC & Authentication Checks', () => {
    it('1.1 Should reject unauthenticated requests to dashboard stats with 401', async () => {
      const res = await request(app).get('/api/v1/admin/dashboard-stats');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('1.2 Should reject customer role with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard-stats')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Forbidden|Admin/i);
    });
  });

  describe('2. Authoritative Dashboard Metrics Payload (GET /api/v1/admin/dashboard-stats)', () => {
    it('2.1 Should return complete KPI metrics and chart aggregates for Admin', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard-stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();

      const { kpis, salesOverview, orderStatusDistribution, recentOrders, lowStockProducts } =
        res.body.data;

      // Validate KPIs
      expect(kpis).toBeDefined();
      expect(typeof kpis.totalProducts).toBe('number');
      expect(typeof kpis.todayOrders).toBe('number');
      expect(typeof kpis.todayRevenue).toBe('number');
      expect(typeof kpis.totalCustomers).toBe('number');

      // Validate Sales Overview
      expect(Array.isArray(salesOverview)).toBe(true);
      expect(salesOverview.length).toBeGreaterThan(0);
      expect(salesOverview[0]).toHaveProperty('date');
      expect(salesOverview[0]).toHaveProperty('revenue');
      expect(salesOverview[0]).toHaveProperty('orderCount');

      // Validate Order Status Distribution
      expect(Array.isArray(orderStatusDistribution)).toBe(true);
      if (orderStatusDistribution.length > 0) {
        expect(orderStatusDistribution[0]).toHaveProperty('status');
        expect(orderStatusDistribution[0]).toHaveProperty('count');
        expect(orderStatusDistribution[0]).toHaveProperty('percentage');
        expect(orderStatusDistribution[0]).toHaveProperty('color');
      }

      // Validate Recent Orders
      expect(Array.isArray(recentOrders)).toBe(true);

      // Validate Low Stock Products
      expect(Array.isArray(lowStockProducts)).toBe(true);
    });

    it('2.2 Should support direct endpoint alias GET /api/admin/dashboard-stats', async () => {
      const res = await request(app)
        .get('/api/admin/dashboard-stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.kpis).toBeDefined();
    });
  });
});
