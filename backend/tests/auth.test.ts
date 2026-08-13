import request from 'supertest';
import app from '../src/app';
import { userRepository } from '../src/repositories/userRepository';
import { authService } from '../src/services/authService';
import bcrypt from 'bcryptjs';

// Mock userRepository methods for reliable, fast isolated testing
jest.mock('../src/repositories/userRepository');

describe('Authentication & Role-Based Authorization Tests', () => {
  const mockCustomer = {
    id: 'user-cust-123',
    name: 'Customer Test',
    email: 'customer@test.com',
    password_hash: '',
    role: 'CUSTOMER' as const,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockAdmin = {
    id: 'user-admin-999',
    name: 'Admin Test',
    email: 'admin@test.com',
    password_hash: '',
    role: 'ADMIN' as const,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeAll(async () => {
    // Generate valid bcrypt hashes for test passwords
    mockCustomer.password_hash = await bcrypt.hash('CorrectPassword123', 10);
    mockAdmin.password_hash = await bcrypt.hash('AdminPassword123', 10);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. Successful registration
  it('1. should register a new customer successfully (201 Created)', async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
    (userRepository.createUser as jest.Mock).mockResolvedValue({
      id: mockCustomer.id,
      name: mockCustomer.name,
      email: mockCustomer.email,
      role: mockCustomer.role,
      created_at: mockCustomer.created_at,
      updated_at: mockCustomer.updated_at,
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Customer Test',
        email: 'customer@test.com',
        password: 'CorrectPassword123',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('customer@test.com');
    expect(res.body.data.user.role).toBe('CUSTOMER');
    expect(res.body.data.user.password_hash).toBeUndefined(); // Password hash never exposed
    expect(res.body.data.token).toBeDefined();
  });

  // 2. Duplicate email rejection
  it('2. should reject registration with duplicate email (400 Bad Request)', async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockCustomer);

    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Customer Duplicate',
        email: 'customer@test.com',
        password: 'CorrectPassword123',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('already registered');
  });

  // 3. Successful login
  it('3. should log in successfully with valid credentials (200 OK)', async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockCustomer);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'customer@test.com',
        password: 'CorrectPassword123',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.password_hash).toBeUndefined();
  });

  // 4. Wrong password rejection
  it('4. should reject login with wrong password (401 Unauthorized)', async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValue(mockCustomer);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'customer@test.com',
        password: 'WrongPassword999',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Invalid email or password');
  });

  // 5. Invalid token rejection
  it('5. should reject access to /api/auth/me with invalid token (401 Unauthorized)', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid_garbage_token_123');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Invalid or expired authentication token');
  });

  // 6. Customer accessing admin endpoint rejection
  it('6. should reject customer accessing admin protected endpoint (403 Forbidden)', async () => {
    const customerToken = authService.generateToken(mockCustomer.id, mockCustomer.email, 'CUSTOMER');

    const res = await request(app)
      .get('/api/admin/protected-test')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Admin role required');
  });

  // 7. Admin accessing protected endpoint success
  it('7. should grant admin access to admin protected endpoint (200 OK)', async () => {
    const adminToken = authService.generateToken(mockAdmin.id, mockAdmin.email, 'ADMIN');

    const res = await request(app)
      .get('/api/admin/protected-test')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('Welcome Admin');
  });
});
