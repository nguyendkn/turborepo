import type { Handler } from 'hono';
import { HTTPException } from 'hono/http-exception';

import { permissionEvaluatorService } from '@/services/permission-evaluator.service';
import type { AppEnv, ApiResponse, PermissionRequest } from '@/types';
import { logger } from '@/utils/logger';
import { extractRequestContext } from '@/utils/request-context';

/**
 * Permission Evaluation Controller
 * Handles permission checking and evaluation for testing/debugging
 */
export const permissionController = {
  /**
   * Check if current user has permission
   * POST /permissions/check
   */
  checkPermission: (async c => {
    try {
      const user = c.get('user');
      if (!user) {
        throw new HTTPException(401, { message: 'Authentication required' });
      }

      const requestData = await c.req.json();

      if (!requestData.action) {
        throw new HTTPException(400, { message: 'Action is required' });
      }

      if (!requestData.resource) {
        throw new HTTPException(400, { message: 'Resource is required' });
      }

      const permissionRequest: PermissionRequest = {
        action: requestData.action,
        resource: requestData.resource,
        resourceId: requestData.resourceId,
        context: requestData.context,
      };

      const requestContext = extractRequestContext(c, {
        location: requestData.location,
      });

      const hasPermission = await permissionEvaluatorService.hasPermission(
        user,
        permissionRequest,
        Object.keys(requestContext).length > 0 ? requestContext : undefined
      );

      const response: ApiResponse = {
        success: true,
        data: {
          hasPermission,
          user: {
            id: user.id,
            email: user.email,
            roles: user.roles.map((role: { name: string }) => role.name),
          },
          request: permissionRequest,
        },
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response);
    } catch (error) {
      logger.error('Check permission failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,

  /**
   * Evaluate permission with detailed result
   * POST /permissions/evaluate
   */
  evaluatePermission: (async c => {
    try {
      const user = c.get('user');
      if (!user) {
        throw new HTTPException(401, { message: 'Authentication required' });
      }

      const requestData = await c.req.json();

      if (!requestData.action) {
        throw new HTTPException(400, { message: 'Action is required' });
      }

      if (!requestData.resource) {
        throw new HTTPException(400, { message: 'Resource is required' });
      }

      const permissionRequest: PermissionRequest = {
        action: requestData.action,
        resource: requestData.resource,
        resourceId: requestData.resourceId,
        context: requestData.context,
      };

      const requestContext = extractRequestContext(c, {
        location: requestData.location,
      });

      const evaluationResult =
        await permissionEvaluatorService.evaluatePermission(
          user,
          permissionRequest,
          requestContext
        );

      const response: ApiResponse = {
        success: true,
        data: {
          evaluation: evaluationResult,
          user: {
            id: user.id,
            email: user.email,
            roles: user.roles.map(
              (role: { name: string; policies: { name: string }[] }) => ({
                name: role.name,
                policies: role.policies.map((p: { name: string }) => p.name),
              })
            ),
          },
          request: permissionRequest,
        },
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response);
    } catch (error) {
      logger.error('Evaluate permission failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,

  /**
   * Check multiple permissions at once
   * POST /permissions/check-multiple
   */
  checkMultiplePermissions: (async c => {
    try {
      const user = c.get('user');
      if (!user) {
        throw new HTTPException(401, { message: 'Authentication required' });
      }

      const requestData = await c.req.json();

      if (!requestData.permissions || !Array.isArray(requestData.permissions)) {
        throw new HTTPException(400, {
          message: 'Permissions array is required',
        });
      }

      const permissionRequests: PermissionRequest[] =
        requestData.permissions.map(
          (perm: {
            action: string;
            resource: string;
            resourceId?: string;
            context?: Record<string, unknown>;
          }) => {
            if (!perm.action || !perm.resource) {
              throw new HTTPException(400, {
                message: 'Each permission must have action and resource',
              });
            }
            return {
              action: perm.action,
              resource: perm.resource,
              resourceId: perm.resourceId,
              context: perm.context,
            };
          }
        );

      const requestContext = extractRequestContext(c, {
        location: requestData.location,
      });

      const results = await permissionEvaluatorService.checkMultiplePermissions(
        user,
        permissionRequests,
        requestContext
      );

      const response: ApiResponse = {
        success: true,
        data: {
          results,
          user: {
            id: user.id,
            email: user.email,
            roles: user.roles.map((role: { name: string }) => role.name),
          },
        },
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response);
    } catch (error) {
      logger.error('Check multiple permissions failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,

  /**
   * Get all permissions for current user
   * GET /permissions/my-permissions
   */
  getMyPermissions: (async c => {
    try {
      const user = c.get('user');
      if (!user) {
        throw new HTTPException(401, { message: 'Authentication required' });
      }

      const permissions = await permissionEvaluatorService.getUserPermissions(
        user.id
      );

      const response: ApiResponse = {
        success: true,
        data: permissions,
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response);
    } catch (error) {
      logger.error('Get my permissions failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,

  /**
   * Get permissions for specific user (admin only)
   * GET /permissions/user/:userId
   */
  getUserPermissions: (async c => {
    try {
      const userId = c.req.param('userId');
      const permissions =
        await permissionEvaluatorService.getUserPermissions(userId);

      const response: ApiResponse = {
        success: true,
        data: permissions,
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response);
    } catch (error) {
      logger.error('Get user permissions failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,

  /**
   * Clear permission cache for current user
   * DELETE /permissions/cache
   */
  clearMyCache: (async c => {
    try {
      const user = c.get('user');
      if (!user) {
        throw new HTTPException(401, { message: 'Authentication required' });
      }

      await permissionEvaluatorService.clearUserCache(user.id);

      const response: ApiResponse = {
        success: true,
        data: { message: 'Permission cache cleared successfully' },
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response);
    } catch (error) {
      logger.error('Clear permission cache failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,

  /**
   * Clear permission cache for specific user (admin only)
   * DELETE /permissions/cache/:userId
   */
  clearUserCache: (async c => {
    try {
      const userId = c.req.param('userId');
      await permissionEvaluatorService.clearUserCache(userId);

      const response: ApiResponse = {
        success: true,
        data: { message: 'User permission cache cleared successfully' },
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response);
    } catch (error) {
      logger.error('Clear user permission cache failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,
};
