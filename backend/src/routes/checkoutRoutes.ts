import { Router } from 'express';
import { validateCart, createPaymentOrder } from '../controllers/checkoutController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/validate-cart', validateCart);
router.post('/create-payment-order', authenticateToken, createPaymentOrder);

export default router;
