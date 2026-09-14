import { Router } from 'express';
import {
  verifyExitToken,
  getExitLogs,
  getExitStatus,
} from '../controllers/exitController';
import { authenticateUser, requireAdmin } from '../middleware/auth';
import { turnstileLimiter } from '../middleware/rateLimiter';

const router = Router();

// Staff/Admin endpoints for Exit Turnstile
router.post('/verify', turnstileLimiter, authenticateUser, requireAdmin, verifyExitToken);
router.post('/scan-qr', turnstileLimiter, authenticateUser, requireAdmin, verifyExitToken);
router.get('/logs', authenticateUser, requireAdmin, getExitLogs);

// Customer/Staff status check endpoint
router.get('/status/:orderId', authenticateUser, getExitStatus);

export default router;
