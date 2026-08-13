import { Router } from 'express';
import { scanExitQr, confirmExitVerification } from '../controllers/exitController';
import { authenticateUser, requireAdmin } from '../middleware/auth';

const router = Router();

router.post('/scan-qr', authenticateUser, requireAdmin, scanExitQr);
router.post('/confirm-exit', authenticateUser, requireAdmin, confirmExitVerification);

export default router;
