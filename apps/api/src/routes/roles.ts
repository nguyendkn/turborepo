import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { roleController } from '@/controllers/role.controller';
import { requirePermission } from '@/middleware/pbac-auth';
import {
  roleQuerySchema,
  createRoleSchema,
  updateRoleSchema,
  assignRoleSchema,
} from '@/schemas/role.schemas';
import type { AppEnv } from '@/types';

/**
 * Role management routes
 */
export const roleRoutes = new Hono<AppEnv>();

/**
 * GET /roles
 * Get all roles with pagination and filtering
 */
roleRoutes.get(
  '/',
  requirePermission('read', 'roles'),
  zValidator('query', roleQuerySchema),
  roleController.getRoles
);

/**
 * GET /roles/:id
 * Get role by ID
 */
roleRoutes.get(
  '/:id',
  requirePermission('read', 'roles'),
  roleController.getRoleById
);

/**
 * POST /roles
 * Create new role
 */
roleRoutes.post(
  '/',
  requirePermission('create', 'roles'),
  zValidator('json', createRoleSchema),
  roleController.createRole
);

/**
 * PUT /roles/:id
 * Update role
 */
roleRoutes.put(
  '/:id',
  requirePermission('update', 'roles'),
  zValidator('json', updateRoleSchema),
  roleController.updateRole
);

/**
 * DELETE /roles/:id
 * Delete role
 */
roleRoutes.delete(
  '/:id',
  requirePermission('delete', 'roles'),
  roleController.deleteRole
);

/**
 * POST /roles/:id/assign
 * Assign role to user
 */
roleRoutes.post(
  '/:id/assign',
  requirePermission('assign', 'roles'),
  zValidator('json', assignRoleSchema),
  roleController.assignRole
);

/**
 * DELETE /roles/:id/assign/:userId
 * Remove role from user
 */
roleRoutes.delete(
  '/:id/assign/:userId',
  requirePermission('assign', 'roles'),
  roleController.removeRole
);
