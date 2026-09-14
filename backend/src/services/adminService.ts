import {
  adminRepository,
  DashboardStats,
  AdminOrdersFilter,
  PaginatedOrdersResult,
  AdminOrderRecord,
  CustomerRecord,
  PaymentRecord,
} from '../repositories/adminRepository';

export class AdminService {
  /**
   * Retrieve aggregated dashboard analytics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    return await adminRepository.getDashboardStats();
  }

  /**
   * Fetch all orders with search, multi-criteria filtering, and pagination
   */
  async getAllOrders(filter: AdminOrdersFilter): Promise<PaginatedOrdersResult> {
    return await adminRepository.getAllOrders(filter);
  }

  /**
   * Fetch single order detailed record
   */
  async getOrderDetailsById(orderId: string): Promise<AdminOrderRecord | null> {
    if (!orderId) {
      const err = new Error('Order ID is required') as any;
      err.statusCode = 400;
      throw err;
    }
    return await adminRepository.getOrderDetailsById(orderId);
  }

  /**
   * Fetch customer directory with order metrics and spend statistics
   */
  async getAllCustomers(filter: { search?: string; page?: number; limit?: number }): Promise<{
    customers: CustomerRecord[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return await adminRepository.getAllCustomers(filter);
  }

  /**
   * Fetch payments ledger
   */
  async getAllPayments(filter: { search?: string; status?: string; page?: number; limit?: number }): Promise<{
    payments: PaymentRecord[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return await adminRepository.getAllPayments(filter);
  }
}

export const adminService = new AdminService();
