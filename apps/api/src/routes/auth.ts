import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { authController } from '@/controllers/auth.controller';
import {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@/schemas/auth.schemas';
import type { AppEnv } from '@/types';

/**
 * Authentication routes
 */
export const authRoutes = new Hono<AppEnv>();

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
