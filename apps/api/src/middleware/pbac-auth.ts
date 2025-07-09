import type { MiddlewareHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';

import { permissionEvaluatorService } from '@/services/permission-evaluator.service';
import type { AppEnv, PermissionRequest } from '@/types';
import { logger } from '@/utils/logger';

/**
 * PBAC Permission middleware factory
 * Checks if user has permission to perform specific action on resource
 *
 * Note: Use authMiddleware from '@/middleware/auth' for authentication.
 * This middleware only handles permission checking and requires an authenticated user.
 */
export function requirePermission(
  action: string,
  resource: string,
  options?: {
    resourceIdParam?: string; // Parameter name for resource ID (e.g., 'id')
    allowSelfAccess?: boolean; // Allow users to access their own resources
    selfAccessUserIdParam?: string; // Parameter name for user ID in self-access
  }
): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const user = c.get('user');

    if (!user) {
      throw new HTTPException(401, {
        message: 'Authentication required',
      });
    }

    // Build permission request
    const resourceId = options?.resourceIdParam
      ? c.req.param(options.resourceIdParam)
      : undefined;
    const permissionRequest: PermissionRequest = {
      action,
      resource,
      ...(resourceId && { resourceId }),
    };

    // Get request context for evaluation
    const ipAddress =
      c.req.header('x-forwarded-for') || c.req.header('x-real-ip');
    const userAgent = c.req.header('user-agent');
    const requestContext = {
      ...(ipAddress && { ipAddress }),
      ...(userAgent && { userAgent }),
      // location could be determined from IP or other headers
    };

    // Check self-access if enabled
    if (options?.allowSelfAccess && options?.selfAccessUserIdParam) {
      const targetUserId = c.req.param(options.selfAccessUserIdParam);
      if (targetUserId === user.id) {
        logger.debug('Self-access granted', {
          userId: user.id,
          action,
          resource,
          targetUserId,
        });
        await next();
        return;
      }
    }

    // Evaluate permission using PBAC
    const hasPermission = await permissionEvaluatorService.hasPermission(
      user,
      permissionRequest,
      requestContext
    );

    if (!hasPermission) {
      logger.warn('PBAC Permission denied', {
        userId: user.id,
        action,
        resource,
        resourceId: permissionRequest.resourceId,
        path: c.req.path,
        method: c.req.method,
      });

      throw new HTTPException(403, {
        message: 'Insufficient permissions',
      });
    }

    logger.debug('PBAC Permission granted', {
      userId: user.id,
      action,
      resource,
      resourceId: permissionRequest.resourceId,
    });

    await next();
  };
}
