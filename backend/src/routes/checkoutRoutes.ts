import { Router } from 'express';
import { validateCart, createPaymentOrder } from '../controllers/checkoutController';
import { authenticateToken } from '../middleware/auth';
import { validateRequest } from '../middleware/validate';
import { validateCartSchema, createPaymentOrderSchema } from '../validators/checkoutValidator';
import { paymentLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/validate-cart', validateRequest(validateCartSchema), validateCart);
router.post(
  '/create-payment-order',
  paymentLimiter,
  authenticateToken,
  validateRequest(createPaymentOrderSchema),
  createPaymentOrder
);

export default router;
