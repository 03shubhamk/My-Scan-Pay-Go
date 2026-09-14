import dotenv from 'dotenv';
import path from 'path';

// Load .env file from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',

  // PostgreSQL Configuration
  PGHOST: process.env.PGHOST || 'localhost',
  PGPORT: parseInt(process.env.PGPORT || '5432', 10),
  PGUSER: process.env.PGUSER || 'postgres',
  PGPASSWORD: process.env.PGPASSWORD || 'postgres',
  PGDATABASE: process.env.PGDATABASE || 'scan_pay_go_db',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/scan_pay_go_db',

  // Security & Token Secrets
  JWT_SECRET: process.env.JWT_SECRET || 'dev_jwt_secret_key_12345',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  EXIT_QR_SECRET: process.env.EXIT_QR_SECRET || 'exit_qr_hmac_secret_key_45678',

  // Razorpay Gateway
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_YourKeyIdHere',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'YourRazorpaySecretHere',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || 'YourRazorpayWebhookSecretHere',

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
};

// Security Assertion: Ensure production deployment does not run with default fallback credentials
if (env.NODE_ENV === 'production') {
  const dangerousDefaults = ['dev_jwt_secret_key_12345', 'exit_qr_hmac_secret_key_45678', 'YourRazorpaySecretHere'];
  if (dangerousDefaults.includes(env.JWT_SECRET) || dangerousDefaults.includes(env.EXIT_QR_SECRET)) {
    throw new Error('[FATAL SECURITY ERROR] Application cannot start in production with default development secrets.');
  }
}

