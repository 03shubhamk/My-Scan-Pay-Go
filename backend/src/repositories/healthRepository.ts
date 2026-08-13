import { checkDatabaseHealth } from '../config/database';

export class HealthRepository {
  async getDatabaseStatus() {
    return await checkDatabaseHealth();
  }
}

export const healthRepository = new HealthRepository();
