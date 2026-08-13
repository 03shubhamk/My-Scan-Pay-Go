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

async function runProductApiTests() {
  console.log('================================================================');
  console.log(' 🛍️ RUNNING PRODUCT MANAGEMENT API TEST SUITE');
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

  const customerToken = authService.generateToken('cust-id-1', 'customer@example.com', 'CUSTOMER');
  const adminToken = authService.generateToken('admin-id-1', 'admin@example.com', 'ADMIN');

  try {
    // 1. List Products (Paginated)
    const res1 = await makeRequest({
      host: 'localhost',
      port: 5000,
      path: '/api/products?page=1&limit=5',
      method: 'GET',
    });
    assert(res1.statusCode === 200 && res1.body.success === true && Array.isArray(res1.body.data.products) && res1.body.data.pagination.page === 1, '1. GET /api/products list products with pagination (200 OK)', res1.body);

    // 2. Barcode Lookup (Existing)
    const res2 = await makeRequest({
      host: 'localhost',
      port: 5000,
      path: '/api/products/barcode/8901030000001',
      method: 'GET',
    });
    assert(res2.statusCode === 200 && res2.body.success === true && res2.body.data.product.barcode === '8901030000001', '2. GET /api/products/barcode/:barcode fast barcode lookup (200 OK)', res2.body);

    // 3. Barcode Lookup (Non-existent 404)
    const res3 = await makeRequest({
      host: 'localhost',
      port: 5000,
      path: '/api/products/barcode/0000000000000',
      method: 'GET',
    });
    assert(res3.statusCode === 404 && res3.body.success === false, '3. GET /api/products/barcode/0000000000000 non-existent barcode (404 Not Found)', res3.body);

    // 4. Customer POST attempt (Forbidden)
    const newBarcode = `890999${Date.now()}`;
    const res4 = await makeRequest(
      {
        host: 'localhost',
        port: 5000,
        path: '/api/products',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerToken}` },
      },
      { name: 'Illegal Product', barcode: newBarcode, category: 'Snacks', price: 50, stockQuantity: 10 }
    );
    assert(res4.statusCode === 403 && res4.body.success === false, '4. Customer cannot POST /api/products (403 Forbidden)', res4.body);

    // 5. Admin POST create product
    const res5 = await makeRequest(
      {
        host: 'localhost',
        port: 5000,
        path: '/api/products',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      },
      { name: 'Test Energy Drink', description: '250ml can', barcode: newBarcode, category: 'Beverages', price: 95.0, stockQuantity: 50 }
    );
    assert(res5.statusCode === 201 && res5.body.success === true && res5.body.data.product.barcode === newBarcode, '5. Admin can POST /api/products (201 Created)', res5.body);

    const createdProductId = res5.body.data.product.id;

    // 6. Duplicate Barcode Rejection
    const res6 = await makeRequest(
      {
        host: 'localhost',
        port: 5000,
        path: '/api/products',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      },
      { name: 'Duplicate Product', barcode: newBarcode, category: 'Beverages', price: 95.0, stockQuantity: 50 }
    );
    assert(res6.statusCode === 400 && res6.body.success === false && res6.body.message.includes('already exists'), '6. Prevent duplicate barcode (400 Bad Request)', res6.body);

    // 7. Admin PUT update product & stock
    const res7 = await makeRequest(
      {
        host: 'localhost',
        port: 5000,
        path: `/api/products/${createdProductId}`,
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      },
      { price: 89.0, stockQuantity: 75 }
    );
    assert(res7.statusCode === 200 && res7.body.success === true && res7.body.data.product.price === 89.0 && res7.body.data.product.stock_quantity === 75, '7. Admin can PUT /api/products/:id update price & stock (200 OK)', res7.body);

    // 8. Search & Category filtering
    const res8 = await makeRequest({
      host: 'localhost',
      port: 5000,
      path: '/api/products?search=Energy&category=Beverages',
      method: 'GET',
    });
    assert(res8.statusCode === 200 && res8.body.data.products.length >= 1, '8. GET /api/products search & category filter (200 OK)', res8.body);

    // 9. Admin DELETE product
    const res9 = await makeRequest({
      host: 'localhost',
      port: 5000,
      path: `/api/products/${createdProductId}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(res9.statusCode === 200 && res9.body.success === true, '9. Admin can DELETE /api/products/:id (200 OK)', res9.body);

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log('================================================================');
  console.log(` RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================');

  if (failed > 0) process.exit(1);
}

runProductApiTests();
