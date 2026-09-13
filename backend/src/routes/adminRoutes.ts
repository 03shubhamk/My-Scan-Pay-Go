import { Router } from 'express';
import {
  getDashboardStats,
  getDashboardAnalytics,
  getInventoryLogs,
} from '../controllers/adminController';
import { authenticateUser, requireAdmin } from '../middleware/auth';

const router = Router();

// Authoritative Admin Dashboard Analytics
router.get('/dashboard-stats', authenticateUser, requireAdmin, getDashboardStats);
router.get('/analytics/dashboard', authenticateUser, requireAdmin, getDashboardAnalytics);
router.get('/inventory/logs', authenticateUser, requireAdmin, getInventoryLogs);

export default router;
