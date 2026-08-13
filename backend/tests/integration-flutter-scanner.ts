import * as http from 'http';

async function makeRequest(options: http.RequestOptions): Promise<{ statusCode: number; body: any }> {
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
    req.end();
  });
}

async function runFlutterScannerIntegrationTests() {
  console.log('================================================================');
  console.log(' 📷 RUNNING FLUTTER BARCODE SCANNER LOOKUP TEST SUITE');
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

  try {
    // 1. Scan Milk Barcode (8901030000001)
    const res1 = await makeRequest({
      host: 'localhost',
      port: 5000,
      path: '/api/products/barcode/8901030000001',
      method: 'GET',
    });
    assert(
      res1.statusCode === 200 &&
        res1.body.success === true &&
        res1.body.data.product.barcode === '8901030000001' &&
        res1.body.data.product.name.includes('Milk'),
      '1. GET /api/products/barcode/8901030000001 - Milk lookup (200 OK)',
      res1.body
    );

    // 2. Scan Chips Barcode (8901491100010)
    const res2 = await makeRequest({
      host: 'localhost',
      port: 5000,
      path: '/api/products/barcode/8901491100010',
      method: 'GET',
    });
    assert(
      res2.statusCode === 200 &&
        res2.body.success === true &&
        res2.body.data.product.barcode === '8901491100010' &&
        res2.body.data.product.name.includes('Lay'),
      '2. GET /api/products/barcode/8901491100010 - Chips lookup (200 OK)',
      res2.body
    );

    // 3. Scan Coke Barcode (8901764012345)
    const res3 = await makeRequest({
      host: 'localhost',
      port: 5000,
      path: '/api/products/barcode/8901764012345',
      method: 'GET',
    });
    assert(
      res3.statusCode === 200 &&
        res3.body.success === true &&
        res3.body.data.product.barcode === '8901764012345' &&
        res3.body.data.product.name.includes('Coca-Cola'),
      '3. GET /api/products/barcode/8901764012345 - Coke lookup (200 OK)',
      res3.body
    );

    // 4. Non-Existent Barcode Lookup (9999999999999) -> Product Not Found Sheet trigger
    const res4 = await makeRequest({
      host: 'localhost',
      port: 5000,
      path: '/api/products/barcode/9999999999999',
      method: 'GET',
    });
    assert(
      res4.statusCode === 404 && res4.body.success === false && res4.body.message.includes('not found'),
      '4. GET /api/products/barcode/9999999999999 - Non-existent barcode lookup (404 Not Found)',
      res4.body
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

runFlutterScannerIntegrationTests();
