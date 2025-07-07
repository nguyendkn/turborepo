import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { roleController } from '@/controllers/role.controller';
import { userController } from '@/controllers/user.controller';
import { authMiddleware } from '@/middleware/auth';
import { requirePermission } from '@/middleware/pbac-auth';
import {
  userQuerySchema,
  createUserSchema,
  updateUserSchema,
} from '@/schemas/user.schemas';
import type { AppEnv } from '@/types';

/**
 * User management routes
 */
export const userRoutes = new Hono<AppEnv>();

// Apply authentication to all user routes
userRoutes.use('*', authMiddleware);

/**
 * GET /users
 * Get all users (admin only)
 */
userRoutes.get(
  '/',
  requirePermission('read', 'users'),
  zValidator('query', userQuerySchema),
  userController.getUsers
);

/**
 * GET /users/:id
 * Get user by ID
 */
userRoutes.get(
  '/:id',
  requirePermission('read', 'users'),
  userController.getUserById
);

/**
 * POST /users
 * Create new user (admin only)
 */
userRoutes.post(
  '/',
  requirePermission('create', 'users'),
  zValidator('json', createUserSchema),
  userController.createUser
);

/**
 * PUT /users/:id
 * Update user (admin only)
 */
userRoutes.put(
  '/:id',
  requirePermission('update', 'users'),
  zValidator('json', updateUserSchema),
  userController.updateUser
);

/**
 * DELETE /users/:id
 * Delete user (admin only)
 */
userRoutes.delete(
  '/:id',
  requirePermission('delete', 'users'),
  userController.deleteUser
);

/**
 * POST /users/:id/activate
 * Activate user account (admin only)
 */
userRoutes.post(
  '/:id/activate',
  requirePermission('activate', 'users'),
  userController.activateUser
);

/**
 * POST /users/:id/deactivate
 * Deactivate user account (admin only)
 */
userRoutes.post(
  '/:id/deactivate',
  requirePermission('deactivate', 'users'),
  userController.deactivateUser
);

/**
 * POST /users/:id/reset-password
 * Reset user password (admin only)
 */
userRoutes.post(
  '/:id/reset-password',
  requirePermission('reset-password', 'users'),
  userController.resetUserPassword
);

/**
 * GET /users/:userId/roles
 * Get roles for a specific user
 */
userRoutes.get(
  '/:userId/roles',
  requirePermission('read', 'user-roles'),
  roleController.getUserRoles
);
