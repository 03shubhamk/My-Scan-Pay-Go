import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/userRepository';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';
import { JwtPayload, UserRole } from '../types';

export class AuthService {
  async registerCustomer(name: string, email: string, password: string) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email address is already registered', 400);
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const user = await userRepository.createUser(name, email, passwordHash, 'CUSTOMER');

    const token = this.generateToken(user.id, user.email, user.role);

    return { user, token };
  }

  async loginUser(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = this.generateToken(user.id, user.email, user.role);

    // Strip sensitive password_hash before returning
    const { password_hash, ...safeUser } = user;

    return { user: safeUser, token };
  }

  async getCurrentUser(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User account not found', 404);
    }
    return user;
  }

  public generateToken(userId: string, email: string, role: UserRole): string {
    const payload: JwtPayload = { userId, email, role };
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });
  }
}

export const authService = new AuthService();
