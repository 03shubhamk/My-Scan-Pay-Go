import * as http from 'http';
import { authService } from '../src/services/authService';

async function makeRequest(options: http.RequestOptions, body?: any): Promise<{ statusCode: number; body: any }> {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res: http.IncomingMessage) => {
      let data = '';
      res.on('data', (chunk: any) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ statusCode: res.statusCode || 500, body: parsed });
        } catch {
          resolve({ statusCode: res.statusCode || 500, body: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runAuthIntegrationTests() {
  console.log('================================================================');
  console.log(' 🔐 RUNNING AUTHENTICATION & RBAC INTEGRATION TEST SUITE');
  console.log('================================================================');

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, testName: string, detail?: any) => {
    if (condition) {
      console.log(` ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(` ❌ FAIL: ${testName}`, detail || '');
      failed++;
    }
  };

  const testEmail = `test.user.${Date.now()}@example.com`;
  const testPassword = 'Password@123';

  try {
    // 1. Customer Registration
    const res1 = await makeRequest(
      {
        host: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { name: 'Test Shopper', email: testEmail, password: testPassword }
    );
    assert(
      res1.statusCode === 201 && res1.body.success === true && res1.body.data.token && res1.body.data.user.role === 'CUSTOMER',
      '1. Customer registration (201 Created)',
      res1.body
    );

    const customerToken = res1.body.data?.token;

    // 2. Duplicate Email Registration Rejection
    const res2 = await makeRequest(
      {
        host: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { name: 'Duplicate User', email: testEmail, password: testPassword }
    );
    assert(res2.statusCode === 400 && res2.body.success === false, '2. Duplicate email rejection (400 Bad Request)', res2.body);

    // 3. Customer Login (Valid Credentials)
    const res3 = await makeRequest(
      {
        host: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: testEmail, password: testPassword }
    );
    assert(res3.statusCode === 200 && res3.body.success === true && res3.body.data.token, '3. Customer login (200 OK)', res3.body);

    // 4. Wrong Password Rejection
    const res4 = await makeRequest(
      {
        host: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: testEmail, password: 'WrongPassword' }
    );
    assert(res4.statusCode === 401 && res4.body.success === false, '4. Wrong password rejection (401 Unauthorized)', res4.body);

    // 5. Invalid JWT Token Rejection
    const res5 = await makeRequest({
      host: 'localhost',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET',
      headers: { Authorization: 'Bearer invalid_jwt_token_format' },
    });
    assert(res5.statusCode === 401 && res5.body.success === false, '5. Invalid token rejection (401 Unauthorized)', res5.body);

    // 6. Customer Accessing Admin-Only Endpoint
    const res6 = await makeRequest({
      host: 'localhost',
      port: 5000,
      path: '/api/admin/protected-test',
      method: 'GET',
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert(res6.statusCode === 403 && res6.body.success === false, '6. Customer rejected from admin endpoint (403 Forbidden)', res6.body);

    // 7. Admin Accessing Protected Endpoint
    const adminToken = authService.generateToken('admin-id-1', 'admin@scanpaygo.com', 'ADMIN');
    const res7 = await makeRequest({
      host: 'localhost',
      port: 5000,
      path: '/api/admin/protected-test',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(res7.statusCode === 200 && res7.body.success === true, '7. Admin access granted to protected endpoint (200 OK)', res7.body);

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log('================================================================');
  console.log(` RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================');

  if (failed > 0) process.exit(1);
}

runAuthIntegrationTests();
