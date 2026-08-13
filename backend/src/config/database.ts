import { Pool } from 'pg';
import { env } from './env';

export const pool = new Pool({
  host: env.PGHOST,
  port: env.PGPORT,
  user: env.PGUSER,
  password: env.PGPASSWORD,
  database: env.PGDATABASE,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('[DB Error]: Unexpected error on idle PostgreSQL client', err);
});

export const checkDatabaseHealth = async (): Promise<{ connected: boolean; latencyMs: number; error?: string }> => {
  const start = Date.now();
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    const latencyMs = Date.now() - start;
    return { connected: true, latencyMs };
  } catch (error: any) {
    const latencyMs = Date.now() - start;
    return {
      connected: false,
      latencyMs,
      error: error.message || 'Database connection error',
    };
  }
};
