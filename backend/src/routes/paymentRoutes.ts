import { Router } from 'express';
import { verifyPayment, reportPaymentFailure, handleRazorpayWebhook } from '../controllers/paymentController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/verify-payment', authenticateToken, verifyPayment);
router.post('/verify', authenticateToken, verifyPayment);
router.post('/failed', authenticateToken, reportPaymentFailure);
router.post('/webhook', handleRazorpayWebhook);

export default router;
