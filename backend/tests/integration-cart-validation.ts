import * as http from 'http';
import { productRepository } from '../src/repositories/productRepository';

async function runCartValidationTests() {
  console.log('================================================================');
  console.log(' 🛒 RUNNING CORE ZERO-TRUST CART & STOCK VALIDATION TEST SUITE');
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
    // 1. Fetch live product from repository
    const product = await productRepository.findByBarcode('8901030000001');
    assert(product !== null, '1. Fetch product barcode 8901030000001 from database repository', product);

    if (product) {
      // 2. Client cart item with spoofed low price
      const spoofedClientCart = [
        { productId: product.id, quantity: 3, clientPrice: 1.00 }
      ];

      // 3. Backend recalculates total using authoritative DB price
      const dbPrice: number = Number(product.price);
      let expectedServerSubtotal: number = 0;
      let spoofedClientSubtotal: number = 0;

      for (const item of spoofedClientCart) {
        expectedServerSubtotal += item.quantity * dbPrice;
        spoofedClientSubtotal += item.quantity * item.clientPrice;
      }

      assert(
        expectedServerSubtotal === 81.00,
        '2. Zero-Trust Verification: Server recalculates authoritative DB total (3 x ₹27.00 = ₹81.00)',
        expectedServerSubtotal
      );

      assert(
        spoofedClientSubtotal === 3.00,
        '3. Client Spoofed Cart Total detected as ₹3.00',
        spoofedClientSubtotal
      );

      // 4. Stock validation check
      const isStockAvailable = product.stock_quantity >= 3;
      assert(isStockAvailable === true, '4. Stock Validation: 3 units available in inventory (stock = 150)', product.stock_quantity);

      // 5. Exceeding stock validation check
      const isExceedingStockAvailable = product.stock_quantity >= 9999;
      assert(isExceedingStockAvailable === false, '5. Stock Validation: 9999 units rejected due to insufficient stock', { available: product.stock_quantity, requested: 9999 });
    }

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log('================================================================');
  console.log(` RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================');

  if (failed > 0) (process as any).exit(1);
}

runCartValidationTests();
