import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController';
import { validateRequest } from '../middleware/validate';
import { registerSchema, loginSchema } from '../validators/authValidator';
import { authenticateUser } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// POST /api/auth/register
router.post('/register', authLimiter, validateRequest(registerSchema), register);

// POST /api/auth/login
router.post('/login', authLimiter, validateRequest(loginSchema), login);

// GET /api/auth/me
router.get('/me', authenticateUser, getMe);

export default router;
