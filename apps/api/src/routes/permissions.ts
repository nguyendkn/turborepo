import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { permissionController } from '@/controllers/permission.controller';
import { authMiddleware } from '@/middleware/auth';
import { requirePermission } from '@/middleware/pbac-auth';
import {
  permissionCheckSchema,
  multiplePermissionsSchema,
} from '@/schemas/permission.schemas';
import type { AppEnv } from '@/types';

/**
 * Permission evaluation routes
 */
export const permissionRoutes = new Hono<AppEnv>();

// Apply authentication to all permission routes
permissionRoutes.use('*', authMiddleware);

/**
 * POST /permissions/check
 * Check if current user has permission
 */
permissionRoutes.post(
  '/check',
  zValidator('json', permissionCheckSchema),
  permissionController.checkPermission
);

/**
 * POST /permissions/evaluate
 * Evaluate permission with detailed result
 */
permissionRoutes.post(
  '/evaluate',
  zValidator('json', permissionCheckSchema),
  permissionController.evaluatePermission
);

/**
 * POST /permissions/check-multiple
 * Check multiple permissions at once
 */
permissionRoutes.post(
  '/check-multiple',
  zValidator('json', multiplePermissionsSchema),
  permissionController.checkMultiplePermissions
);

/**
 * GET /permissions/my-permissions
 * Get all permissions for current user
 */
permissionRoutes.get(
  '/my-permissions',
  permissionController.getMyPermissions
);

/**
 * GET /permissions/user/:userId
 * Get permissions for specific user (admin only)
 */
permissionRoutes.get(
  '/user/:userId',
  requirePermission('read', 'user-permissions'),
  permissionController.getUserPermissions
);

/**
 * DELETE /permissions/cache
 * Clear permission cache for current user
 */
permissionRoutes.delete(
  '/cache',
  permissionController.clearMyCache
);

/**
 * DELETE /permissions/cache/:userId
 * Clear permission cache for specific user (admin only)
 */
permissionRoutes.delete(
  '/cache/:userId',
  requirePermission('manage', 'permission-cache'),
  permissionController.clearUserCache
);
