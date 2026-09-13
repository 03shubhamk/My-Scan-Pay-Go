import { adminRepository, DashboardStats } from '../repositories/adminRepository';

export class AdminService {
  /**
   * Retrieve aggregated dashboard analytics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    return await adminRepository.getDashboardStats();
  }
}

export const adminService = new AdminService();
