import { Router } from 'express';
import {
  verifyExitToken,
  getExitLogs,
  getExitStatus,
} from '../controllers/exitController';
import { authenticateUser, requireAdmin } from '../middleware/auth';

const router = Router();

// Staff/Admin endpoints for Exit Turnstile
router.post('/verify', authenticateUser, requireAdmin, verifyExitToken);
router.post('/scan-qr', authenticateUser, requireAdmin, verifyExitToken);
router.get('/logs', authenticateUser, requireAdmin, getExitLogs);

// Customer/Staff status check endpoint
router.get('/status/:orderId', authenticateUser, getExitStatus);

export default router;
