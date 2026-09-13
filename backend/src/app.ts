import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import healthRoutes from './routes/healthRoutes';
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import checkoutRoutes from './routes/checkoutRoutes';
import paymentRoutes from './routes/paymentRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import exitRoutes from './routes/exitRoutes';
import adminRoutes from './routes/adminRoutes';
import { authenticateUser, requireAdmin } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { env } from './config/env';

const app = express();

// Secure HTTP Headers
app.use(helmet());

// CORS Configuration
app.use(cors({
  origin: env.CORS_ORIGIN === '*' ? (_origin, callback) => callback(null, true) : env.CORS_ORIGIN,
  credentials: true
}));

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Direct Health Endpoint GET /api/health
app.use('/api/health', healthRoutes);

// Direct Auth Routes (POST /api/auth/register, POST /api/auth/login, GET /api/auth/me)
app.use('/api/auth', authRoutes);

// Direct Product Routes (GET /api/products, POST /api/products, etc.)
app.use('/api/products', productRoutes);

// Direct Order Routes (POST /api/orders, GET /api/orders, GET /api/orders/:id)
app.use('/api/orders', orderRoutes);

// Direct Checkout & Payment Routes
app.use('/api/checkout', checkoutRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/exit-verification', exitRoutes);
app.use('/api/admin', adminRoutes);

// Protected Admin Test Endpoint for RBAC Verification
app.get('/api/admin/protected-test', authenticateUser, requireAdmin, (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Welcome Admin! Access granted to protected endpoint.' });
});

// Versioned API Routes GET /api/v1/*
app.use('/api/v1', routes);

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Requested API endpoint not found' });
});

// Centralized Error Handler
app.use(errorHandler);

export default app;
