import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).trim().min(2, 'Name must be at least 2 characters'),
    email: z.string({ required_error: 'Email is required' }).trim().toLowerCase().email('Invalid email address format'),
    password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).trim().toLowerCase().email('Invalid email address format'),
    password: z.string({ required_error: 'Password is required' }).min(1, 'Password cannot be empty'),
  }),
});
