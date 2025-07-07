import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { userController } from '@/controllers/user.controller';
import { requireRole, requirePermission } from '@/middleware/auth';
import { UserRole } from '@/types/app';
import type { AppEnv } from '@/types/app';

/**
 * User management routes
 */
export const userRoutes = new Hono<AppEnv>();

/**
 * Query parameters validation schema
 */
const querySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(100))
    .optional(),
  search: z.string().optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z
    .string()
    .transform(val => val === 'true')
    .optional(),
  sortBy: z
    .enum(['createdAt', 'updatedAt', 'email', 'firstName', 'lastName'])
    .optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

/**
 * Create user validation schema
 */
const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
});

/**
 * Update user validation schema
 */
const updateUserSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
});

/**
 * GET /users
 * Get all users (admin only)
 */
userRoutes.get(
  '/',
  requirePermission('users:read'),
  zValidator('query', querySchema),
  userController.getUsers
);

/**
 * GET /users/:id
 * Get user by ID
 */
userRoutes.get(
  '/:id',
  requirePermission('users:read'),
  userController.getUserById
);

/**
 * POST /users
 * Create new user (admin only)
 */
userRoutes.post(
  '/',
  requireRole(UserRole.ADMIN),
  zValidator('json', createUserSchema),
  userController.createUser
);

/**
 * PUT /users/:id
 * Update user (admin only)
 */
userRoutes.put(
  '/:id',
  requirePermission('users:write'),
  zValidator('json', updateUserSchema),
  userController.updateUser
);

/**
 * DELETE /users/:id
 * Delete user (admin only)
 */
userRoutes.delete(
  '/:id',
  requireRole(UserRole.ADMIN),
  userController.deleteUser
);

/**
 * POST /users/:id/activate
 * Activate user account (admin only)
 */
userRoutes.post(
  '/:id/activate',
  requireRole(UserRole.ADMIN),
  userController.activateUser
);

/**
 * POST /users/:id/deactivate
 * Deactivate user account (admin only)
 */
userRoutes.post(
  '/:id/deactivate',
  requireRole(UserRole.ADMIN),
  userController.deactivateUser
);

/**
 * POST /users/:id/reset-password
 * Reset user password (admin only)
 */
userRoutes.post(
  '/:id/reset-password',
  requireRole(UserRole.ADMIN),
  userController.resetUserPassword
);
