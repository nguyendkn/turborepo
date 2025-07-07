import type { Handler } from 'hono';
import { HTTPException } from 'hono/http-exception';

import { roleService } from '@/services/role.service';
import { permissionEvaluatorService } from '@/services/permission-evaluator.service';
import type { AppEnv, ApiResponse } from '@/types';
import { logger } from '@/utils/logger';

/**
 * Role Management Controller
 * Handles CRUD operations for dynamic roles
 */
export const roleController = {
  /**
   * Get all roles
   * GET /roles
   */
  getRoles: (async c => {
    try {
      const query = c.req.query();
      const page = parseInt(query.page || '1');
      const limit = parseInt(query.limit || '20');
      const includeInactive = query.includeInactive === 'true';
      const systemRolesOnly = query.systemRolesOnly ? query.systemRolesOnly === 'true' : undefined;

      const result = await roleService.getRoles({
        page,
        limit,
        includeInactive,
        ...(systemRolesOnly !== undefined && { systemRolesOnly }),
      });

      const response: ApiResponse = {
        success: true,
        data: result.roles,
        meta: result.pagination,
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response);
    } catch (error) {
      logger.error('Get roles failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,

  /**
   * Get role by ID
   * GET /roles/:id
   */
  getRoleById: (async c => {
    try {
      const id = c.req.param('id');
      const role = await roleService.getRoleById(id);

      const response: ApiResponse = {
        success: true,
        data: role,
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response);
    } catch (error) {
      logger.error('Get role by ID failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,

  /**
   * Create new role
   * POST /roles
   */
  createRole: (async c => {
    try {
      const user = c.get('user');
      const roleData = await c.req.json();

      // Validate required fields
      if (!roleData.name) {
        throw new HTTPException(400, { message: 'Role name is required' });
      }

      if (!roleData.policyIds || !Array.isArray(roleData.policyIds)) {
        throw new HTTPException(400, { message: 'Policy IDs array is required' });
      }

      const role = await roleService.createRole({
        name: roleData.name,
        ...(roleData.description && { description: roleData.description }),
        policyIds: roleData.policyIds,
        isSystemRole: roleData.isSystemRole || false,
        ...(roleData.metadata && { metadata: roleData.metadata }),
        ...(user?.id && { createdBy: user.id }),
      });

      const response: ApiResponse = {
        success: true,
        data: role,
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response, 201);
    } catch (error) {
      logger.error('Create role failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,

  /**
   * Update role
   * PUT /roles/:id
   */
  updateRole: (async c => {
    try {
      const id = c.req.param('id');
      const updates = await c.req.json();

      const role = await roleService.updateRole(id, updates);

      const response: ApiResponse = {
        success: true,
        data: role,
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response);
    } catch (error) {
      logger.error('Update role failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,

  /**
   * Delete role
   * DELETE /roles/:id
   */
  deleteRole: (async c => {
    try {
      const id = c.req.param('id');
      await roleService.deleteRole(id);

      const response: ApiResponse = {
        success: true,
        data: { message: 'Role deleted successfully' },
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response);
    } catch (error) {
      logger.error('Delete role failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,

  /**
   * Assign role to user
   * POST /roles/:id/assign
   */
  assignRole: (async c => {
    try {
      const roleId = c.req.param('id');
      const assignmentData = await c.req.json();
      const currentUser = c.get('user');

      if (!assignmentData.userId) {
        throw new HTTPException(400, { message: 'User ID is required' });
      }

      const expiresAt = assignmentData.expiresAt ? new Date(assignmentData.expiresAt) : undefined;

      await roleService.assignRoleToUser(
        assignmentData.userId,
        roleId,
        currentUser?.id,
        expiresAt
      );

      const response: ApiResponse = {
        success: true,
        data: { message: 'Role assigned successfully' },
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response);
    } catch (error) {
      logger.error('Assign role failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,

  /**
   * Remove role from user
   * DELETE /roles/:id/assign/:userId
   */
  removeRole: (async c => {
    try {
      const roleId = c.req.param('id');
      const userId = c.req.param('userId');

      await roleService.removeRoleFromUser(userId, roleId);

      const response: ApiResponse = {
        success: true,
        data: { message: 'Role removed successfully' },
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response);
    } catch (error) {
      logger.error('Remove role failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,

  /**
   * Get user roles
   * GET /users/:userId/roles
   */
  getUserRoles: (async c => {
    try {
      const userId = c.req.param('userId');
      const roles = await permissionEvaluatorService.getUserRoles(userId);

      const response: ApiResponse = {
        success: true,
        data: roles,
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response);
    } catch (error) {
      logger.error('Get user roles failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,
};
