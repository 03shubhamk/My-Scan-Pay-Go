import { Router } from 'express';
import { getDashboardAnalytics, getInventoryLogs } from '../controllers/adminController';
import { authenticateUser, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/analytics/dashboard', authenticateUser, requireAdmin, getDashboardAnalytics);
router.get('/inventory/logs', authenticateUser, requireAdmin, getInventoryLogs);

export default router;
