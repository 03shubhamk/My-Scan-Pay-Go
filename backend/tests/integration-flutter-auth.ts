import * as http from 'http';

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

async function runFlutterAuthIntegrationTests() {
  console.log('================================================================');
  console.log(' 📱 RUNNING FLUTTER BACKEND AUTH INTEGRATION TEST SUITE');
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

  const testEmail = `flutter.user.${Date.now()}@example.com`;
  const testPassword = 'Password@123';
  const testName = 'Flutter Customer';

  try {
    // 1. Customer Register (POST /api/auth/register)
    const res1 = await makeRequest(
      {
        host: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { name: testName, email: testEmail, password: testPassword }
    );
    assert(
      res1.statusCode === 201 && res1.body.success === true && res1.body.data.token && res1.body.data.user.email === testEmail,
      '1. POST /api/auth/register - Register customer account (201 Created)',
      res1.body
    );

    const userToken = res1.body.data?.token;

    // 2. Customer Login (POST /api/auth/login)
    const res2 = await makeRequest(
      {
        host: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: testEmail, password: testPassword }
    );
    assert(
      res2.statusCode === 200 && res2.body.success === true && res2.body.data.token && res2.body.data.user.role === 'CUSTOMER',
      '2. POST /api/auth/login - Login with valid credentials (200 OK)',
      res2.body
    );

    // 3. Session Verification / Get Current User (GET /api/auth/me)
    const res3 = await makeRequest({
      host: 'localhost',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET',
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(
      res3.statusCode === 200 && res3.body.success === true && res3.body.data.user.email === testEmail,
      '3. GET /api/auth/me - Verify session persistence & current user (200 OK)',
      res3.body
    );

    // 4. Invalid Email Format Rejection
    const res4 = await makeRequest(
      {
        host: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'not-an-email', password: 'Password@123' }
    );
    assert(
      res4.statusCode === 400 && res4.body.success === false,
      '4. POST /api/auth/login - Reject invalid email format (400 Bad Request)',
      res4.body
    );

    // 5. Wrong Password Rejection
    const res5 = await makeRequest(
      {
        host: 'localhost',
        port: 5000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: testEmail, password: 'WrongPassword999!' }
    );
    assert(
      res5.statusCode === 401 && res5.body.success === false && res5.body.message.includes('Invalid email or password'),
      '5. POST /api/auth/login - Reject wrong password (401 Unauthorized)',
      res5.body
    );

    // 6. Duplicate Email Registration Prevention
    const res6 = await makeRequest(
      {
        host: 'localhost',
        port: 5000,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { name: 'Duplicate User', email: testEmail, password: testPassword }
    );
    assert(
      res6.statusCode === 400 && res6.body.success === false && res6.body.message.includes('already registered'),
      '6. POST /api/auth/register - Prevent duplicate email registration (400 Bad Request)',
      res6.body
    );

    // 7. Invalid Token / Logout Protection (GET /api/auth/me with bad token)
    const res7 = await makeRequest({
      host: 'localhost',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET',
      headers: { Authorization: 'Bearer invalid_or_logged_out_jwt_token' },
    });
    assert(
      res7.statusCode === 401 && res7.body.success === false,
      '7. GET /api/auth/me - Reject invalid/cleared token on logout (401 Unauthorized)',
      res7.body
    );

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log('================================================================');
  console.log(` RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================');

  if (failed > 0) process.exit(1);
}

runFlutterAuthIntegrationTests();
