import { Router } from 'express';
import {
  getDashboardStats,
  getDashboardAnalytics,
  getAdminOrders,
  getAdminOrderDetails,
  getAdminCustomers,
  getAdminPayments,
  getInventoryLogs,
} from '../controllers/adminController';
import { authenticateUser, requireAdmin } from '../middleware/auth';

const router = Router();

// Executive Dashboard & Telemetry
router.get('/dashboard-stats', authenticateUser, requireAdmin, getDashboardStats);
router.get('/analytics/dashboard', authenticateUser, requireAdmin, getDashboardAnalytics);

// Orders & Order Details
router.get('/orders', authenticateUser, requireAdmin, getAdminOrders);
router.get('/orders/:id', authenticateUser, requireAdmin, getAdminOrderDetails);

// Customers Directory
router.get('/customers', authenticateUser, requireAdmin, getAdminCustomers);

// Payments Ledger
router.get('/payments', authenticateUser, requireAdmin, getAdminPayments);

// Inventory Logs
router.get('/inventory/logs', authenticateUser, requireAdmin, getInventoryLogs);

export default router;
