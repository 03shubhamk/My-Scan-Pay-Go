import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authService } from '../src/services/authService';
import { env } from '../src/config/env';
import { JwtPayload } from '../src/types';

async function runUnitTests() {
  console.log('================================================================');
  console.log(' 🔐 AUTHENTICATION & SECURITY UNIT TEST VERIFICATION');
  console.log('================================================================');

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, testName: string) => {
    if (condition) {
      console.log(` ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(` ❌ FAIL: ${testName}`);
      failed++;
    }
  };

  // Test 1: Password Hashing
  const rawPassword = 'SecretPassword@123';
  const hash = await bcrypt.hash(rawPassword, 10);
  assert(hash !== rawPassword && hash.startsWith('$2a$'), '1. Passwords are securely hashed with bcrypt (never plain text)');

  // Test 2: Password Verification
  const validCompare = await bcrypt.compare(rawPassword, hash);
  const invalidCompare = await bcrypt.compare('WrongPassword@999', hash);
  assert(validCompare === true && invalidCompare === false, '2. Password comparison correctly validates correct/wrong passwords');

  // Test 3: JWT Token Signing & Decoding
  const token = authService.generateToken('user-uuid-123', 'customer@example.com', 'CUSTOMER');
  const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
  assert(decoded.userId === 'user-uuid-123' && decoded.role === 'CUSTOMER', '3. JWT Token correctly embeds user ID and role');

  // Test 4: Admin Role JWT Token
  const adminToken = authService.generateToken('admin-uuid-999', 'admin@example.com', 'ADMIN');
  const adminDecoded = jwt.verify(adminToken, env.JWT_SECRET) as JwtPayload;
  assert(adminDecoded.role === 'ADMIN', '4. Admin JWT Token correctly embeds ADMIN role');

  console.log('================================================================');
  console.log(` RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================');

  if (failed > 0) process.exit(1);
}

runUnitTests();
