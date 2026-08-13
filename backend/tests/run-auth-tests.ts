import request from 'supertest';
import app from '../src/app';
import { userRepository } from '../src/repositories/userRepository';
import { authService } from '../src/services/authService';
import bcrypt from 'bcryptjs';

async function runAuthTestSuite() {
  console.log('================================================================');
  console.log(' 🧪 RUNNING AUTHENTICATION & RBAC AUTOMATED TEST SUITE');
  console.log('================================================================');

  let passed = 0;
  let failed = 0;

  const mockCustomer = {
    id: 'user-cust-123',
    name: 'Customer Test',
    email: 'customer@test.com',
    password_hash: await bcrypt.hash('CorrectPassword123', 10),
    role: 'CUSTOMER' as const,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockAdmin = {
    id: 'user-admin-999',
    name: 'Admin Test',
    email: 'admin@test.com',
    password_hash: await bcrypt.hash('AdminPassword123', 10),
    role: 'ADMIN' as const,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const assert = (condition: boolean, testName: string) => {
    if (condition) {
      console.log(` ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(` ❌ FAIL: ${testName}`);
      failed++;
    }
  };

  try {
    // 1. Successful registration
    userRepository.findByEmail = async () => null;
    userRepository.createUser = async () => mockCustomer;

    const res1 = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Customer Test', email: 'customer@test.com', password: 'CorrectPassword123' });
    
    assert(res1.status === 201 && res1.body.success === true && res1.body.data.user.role === 'CUSTOMER' && !res1.body.data.user.password_hash, '1. Successful registration (201 Created)');

    // 2. Duplicate email rejection
    userRepository.findByEmail = async () => mockCustomer;

    const res2 = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Customer Duplicate', email: 'customer@test.com', password: 'CorrectPassword123' });

    assert(res2.status === 400 && res2.body.success === false, '2. Duplicate email rejection (400 Bad Request)');

    // 3. Successful login
    const res3 = await request(app)
      .post('/api/auth/login')
      .send({ email: 'customer@test.com', password: 'CorrectPassword123' });

    assert(res3.status === 200 && res3.body.success === true && res3.body.data.token && !res3.body.data.user.password_hash, '3. Successful login (200 OK)');

    // 4. Wrong password rejection
    const res4 = await request(app)
      .post('/api/auth/login')
      .send({ email: 'customer@test.com', password: 'WrongPassword999' });

    assert(res4.status === 401 && res4.body.success === false, '4. Wrong password rejection (401 Unauthorized)');

    // 5. Invalid token rejection
    const res5 = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid_garbage_token_123');

    assert(res5.status === 401 && res5.body.success === false, '5. Invalid token rejection (401 Unauthorized)');

    // 6. Customer accessing admin endpoint rejection
    const customerToken = authService.generateToken(mockCustomer.id, mockCustomer.email, 'CUSTOMER');
    const res6 = await request(app)
      .get('/api/admin/protected-test')
      .set('Authorization', `Bearer ${customerToken}`);

    assert(res6.status === 403 && res6.body.success === false, '6. Customer accessing admin endpoint rejection (403 Forbidden)');

    // 7. Admin accessing protected endpoint success
    const adminToken = authService.generateToken(mockAdmin.id, mockAdmin.email, 'ADMIN');
    const res7 = await request(app)
      .get('/api/admin/protected-test')
      .set('Authorization', `Bearer ${adminToken}`);

    assert(res7.status === 200 && res7.body.success === true, '7. Admin accessing protected endpoint success (200 OK)');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log('================================================================');
  console.log(` RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runAuthTestSuite();
