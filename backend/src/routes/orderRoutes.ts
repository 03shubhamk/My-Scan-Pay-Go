import { Router } from 'express';
import { createOrder, getUserOrders, getOrderById } from '../controllers/orderController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/', authenticateToken, createOrder);
router.get('/', authenticateToken, getUserOrders);
router.get('/:id', authenticateToken, getOrderById);

export default router;
