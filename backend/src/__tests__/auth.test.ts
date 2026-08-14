import jwt from 'jsonwebtoken';

describe('JWT Authentication Middleware Security Tests', () => {
  const jwtSecret = 'super-secret-jwt-key-scan-pay-go';

  interface UserPayload {
    id: string;
    email: string;
    role: 'customer' | 'admin' | 'staff';
  }

  const signToken = (payload: UserPayload, expiresIn = '1h'): string => {
    return jwt.sign(payload, jwtSecret, { expiresIn });
  };

  const verifyToken = (token: string): UserPayload => {
    return jwt.verify(token, jwtSecret) as UserPayload;
  };

  test('should generate valid JWT payload with role claims', () => {
    const payload: UserPayload = { id: 'usr-101', email: 'admin@scanpaygo.com', role: 'admin' };
    const token = signToken(payload);

    expect(token).toBeDefined();
    const decoded = verifyToken(token);
    expect(decoded.id).toBe('usr-101');
    expect(decoded.email).toBe('admin@scanpaygo.com');
    expect(decoded.role).toBe('admin');
  });

  test('should fail verification when signature is invalid', () => {
    const payload: UserPayload = { id: 'usr-102', email: 'hacker@test.com', role: 'customer' };
    const invalidToken = jwt.sign(payload, 'wrong-secret-key');

    expect(() => verifyToken(invalidToken)).toThrow();
  });

  test('should extract authorization bearer token correctly from headers', () => {
    const authHeader = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.testToken';
    const extractBearer = (header?: string) => {
      if (!header || !header.startsWith('Bearer ')) return null;
      return header.split(' ')[1];
    };

    expect(extractBearer(authHeader)).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.testToken');
    expect(extractBearer('Basic dXNlcjpwYXNz')).toBeNull();
    expect(extractBearer(undefined)).toBeNull();
  });
});
