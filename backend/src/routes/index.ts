import { Router } from 'express';
import healthRoutes from './healthRoutes';
import authRoutes from './authRoutes';
import productRoutes from './productRoutes';
import checkoutRoutes from './checkoutRoutes';
import paymentRoutes from './paymentRoutes';
import orderRoutes from './orderRoutes';
import exitRoutes from './exitRoutes';
import adminRoutes from './adminRoutes';
import inventoryRoutes from './inventoryRoutes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/checkout', checkoutRoutes);
router.use('/payments', paymentRoutes);
router.use('/orders', orderRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/exit-verification', exitRoutes);
router.use('/admin', adminRoutes);

export default router;
