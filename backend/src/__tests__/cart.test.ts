import crypto from 'crypto';

describe('Cart Calculation & Security Utilities', () => {
  const secretKey = 'test-secret-key-scan-pay-go';

  const calculateCartTotal = (items: Array<{ price: number; quantity: number; discountPercent?: number }>) => {
    return items.reduce((acc, item) => {
      const discount = item.discountPercent ? (item.price * item.discountPercent) / 100 : 0;
      const effectivePrice = item.price - discount;
      return acc + effectivePrice * item.quantity;
    }, 0);
  };

  const generateExitHmac = (orderId: string, userId: string, timestamp: number, secret: string) => {
    const payload = `${orderId}:${userId}:${timestamp}`;
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  };

  const verifyExitHmac = (orderId: string, userId: string, timestamp: number, token: string, secret: string) => {
    const expected = generateExitHmac(orderId, userId, timestamp, secret);
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  };

  test('should accurately calculate subtotal without discounts', () => {
    const cart = [
      { price: 100, quantity: 2 },
      { price: 50, quantity: 1 },
    ];
    expect(calculateCartTotal(cart)).toBe(250);
  });

  test('should apply item level discounts correctly', () => {
    const cart = [
      { price: 100, quantity: 1, discountPercent: 10 }, // 90
      { price: 200, quantity: 2, discountPercent: 20 }, // 160 * 2 = 320
    ];
    expect(calculateCartTotal(cart)).toBe(410);
  });

  test('should generate and verify valid exit QR HMAC tokens', () => {
    const orderId = 'ORD-2026-9901';
    const userId = 'USR-5501';
    const timestamp = Date.now();

    const token = generateExitHmac(orderId, userId, timestamp, secretKey);
    expect(token).toBeDefined();
    expect(token.length).toBe(64);

    const isValid = verifyExitHmac(orderId, userId, timestamp, token, secretKey);
    expect(isValid).toBe(true);
  });

  test('should reject invalid or tampered exit QR tokens', () => {
    const orderId = 'ORD-2026-9901';
    const userId = 'USR-5501';
    const timestamp = Date.now();

    const tamperedToken = generateExitHmac(orderId, userId, timestamp, 'wrong-secret');
    const isValid = verifyExitHmac(orderId, userId, timestamp, tamperedToken, secretKey);
    expect(isValid).toBe(false);
  });
});
