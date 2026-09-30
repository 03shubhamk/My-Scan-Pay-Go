import request from 'supertest';
import app from '../src/app';

describe('Health & Diagnostic Endpoint Tests', () => {
  it('1. GET /api/v1/health: Should return 200 with database connectivity and server uptime', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.status).toBe('UP');
    expect(typeof res.body.data.uptime).toBe('number');
  });

  it('2. GET /health root alias: Should return 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

