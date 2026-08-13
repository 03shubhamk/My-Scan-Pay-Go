import { healthRepository } from '../repositories/healthRepository';
import { env } from '../config/env';

export class HealthService {
  async checkSystemHealth() {
    const dbHealth = await healthRepository.getDatabaseStatus();

    return {
      status: dbHealth.connected ? 'UP' : 'DEGRADED',
      service: 'Scan. Pay. Go. Backend API',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      database: {
        status: dbHealth.connected ? 'CONNECTED' : 'DISCONNECTED',
        latencyMs: dbHealth.latencyMs,
        ...(dbHealth.error && { error: dbHealth.error }),
      },
    };
  }
}

export const healthService = new HealthService();
