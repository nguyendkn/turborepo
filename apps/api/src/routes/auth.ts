import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { authController } from '@/controllers/auth.controller';
import type { AppEnv } from '@/types/app';

/**
 * Authentication routes
 */
export const authRoutes = new Hono<AppEnv>();

/**
 * Login validation schema
 */
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

/**
 * Register validation schema
 */
const registerSchema = z
  .object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

/**
 * Refresh token validation schema
 */
const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

/**
 * Forgot password validation schema
 */
const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

/**
 * Reset password validation schema
 */
const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

/**
 * POST /auth/login
 * User login
 */
authRoutes.post(
  '/login',
  zValidator('json', loginSchema),
  authController.login
);

/**
 * POST /auth/register
 * User registration
 */
authRoutes.post(
  '/register',
  zValidator('json', registerSchema),
  authController.register
);

/**
 * POST /auth/refresh
 * Refresh access token
 */
authRoutes.post(
  '/refresh',
  zValidator('json', refreshTokenSchema),
  authController.refresh
);

/**
 * POST /auth/logout
 * User logout
 */
authRoutes.post('/logout', authController.logout);

/**
 * POST /auth/forgot-password
 * Request password reset
 */
authRoutes.post(
  '/forgot-password',
  zValidator('json', forgotPasswordSchema),
  authController.forgotPassword
);

/**
 * POST /auth/reset-password
 * Reset password with token
 */
authRoutes.post(
  '/reset-password',
  zValidator('json', resetPasswordSchema),
  authController.resetPassword
);

/**
 * GET /auth/verify-email/:token
 * Verify email address
 */
authRoutes.get('/verify-email/:token', authController.verifyEmail);
