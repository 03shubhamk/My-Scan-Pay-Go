import { Router } from 'express';
import { verifyPayment, handleRazorpayWebhook } from '../controllers/paymentController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/verify-payment', authenticateToken, verifyPayment);
router.post('/webhook', handleRazorpayWebhook);

export default router;
