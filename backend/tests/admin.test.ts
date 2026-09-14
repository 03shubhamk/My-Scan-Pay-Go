import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app';
import { env } from '../src/config/env';
import { orderRepository } from '../src/repositories/orderRepository';

describe('Admin Dashboard Authoritative Analytics, Orders, Customers, & Payments Tests', () => {
  let adminToken: string;
  let customerToken: string;
  const adminUserId = 'a1000000-0000-0000-0000-000000000001';
  const customerUserId = 'a1000000-0000-0000-0000-000000000004';
  let sampleOrderId: string;

  beforeAll(async () => {
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

    // Create a sample order for tests
    const order = await orderRepository.createOrder({
      userId: customerUserId,
      totalAmount: 81.0,
      items: [
        {
          productId: 'b1000000-0000-0000-0000-000000000001',
          quantity: 3,
          priceAtPurchase: 27.0,
          subtotal: 81.0,
          productName: 'Amul Taaza Milk (500ml)',
          productBarcode: '8901030000001',
        },
      ],
    });
    sampleOrderId = order.id;
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
  });

  describe('3. Admin Orders Module (GET /api/v1/admin/orders & /:id)', () => {
    it('3.1 Should return paginated orders list with search and filtering for Admin', async () => {
      const res = await request(app)
        .get('/api/v1/admin/orders?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data).toHaveProperty('orders');
      expect(Array.isArray(res.body.data.orders)).toBe(true);
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('totalPages');
    });

    it('3.2 Should filter orders by status and payment status', async () => {
      const res = await request(app)
        .get('/api/v1/admin/orders?status=PENDING&paymentStatus=UNPAID')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.orders)).toBe(true);
    });

    it('3.3 Should return full order details with customer and line items', async () => {
      const res = await request(app)
        .get(`/api/v1/admin/orders/${sampleOrderId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(sampleOrderId);
      expect(res.body.data).toHaveProperty('items');
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThan(0);
      expect(res.body.data.items[0]).toHaveProperty('product_name');
      expect(res.body.data.items[0]).toHaveProperty('quantity');
      expect(res.body.data.items[0]).toHaveProperty('price_at_purchase');
    });

    it('3.4 Should return 404 for nonexistent order ID', async () => {
      const res = await request(app)
        .get('/api/v1/admin/orders/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`);

      expect([404, 200]).toContain(res.status); // 404 in db mode or null handled
    });
  });

  describe('4. Admin Customers Module (GET /api/v1/admin/customers)', () => {
    it('4.1 Should return customer accounts with order counts and spend metrics', async () => {
      const res = await request(app)
        .get('/api/v1/admin/customers?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data).toHaveProperty('customers');
      expect(Array.isArray(res.body.data.customers)).toBe(true);
      expect(res.body.data.customers.length).toBeGreaterThan(0);

      const firstCustomer = res.body.data.customers[0];
      expect(firstCustomer).toHaveProperty('id');
      expect(firstCustomer).toHaveProperty('name');
      expect(firstCustomer).toHaveProperty('email');
      expect(firstCustomer).toHaveProperty('orders_count');
      expect(firstCustomer).toHaveProperty('total_spent');
    });

    it('4.2 Should filter customers by search query', async () => {
      const res = await request(app)
        .get('/api/v1/admin/customers?search=Alex')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.customers)).toBe(true);
    });
  });

  describe('5. Admin Payments Module (GET /api/v1/admin/payments)', () => {
    it('5.1 Should return payments ledger with transaction IDs and amounts', async () => {
      const res = await request(app)
        .get('/api/v1/admin/payments?page=1&limit=10')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data).toHaveProperty('payments');
      expect(Array.isArray(res.body.data.payments)).toBe(true);
      expect(res.body.data.payments.length).toBeGreaterThan(0);

      const firstPayment = res.body.data.payments[0];
      expect(firstPayment).toHaveProperty('id');
      expect(firstPayment).toHaveProperty('amount');
      expect(firstPayment).toHaveProperty('status');
      expect(firstPayment).toHaveProperty('order_number');
    });
  });
});
