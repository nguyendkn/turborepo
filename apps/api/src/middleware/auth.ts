import type { MiddlewareHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import jwt from 'jsonwebtoken';

import { config } from '@/config/app';
import { UserRole } from '@/types/app';
import type { AppEnv, JwtPayload, User } from '@/types/app';
import { logger } from '@/utils/logger';

/**
 * Authentication middleware
 */
export const authMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  try {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HTTPException(401, {
        message: 'Missing or invalid authorization header',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token
    const payload = jwt.verify(token, config.jwt.secret) as JwtPayload;

    // TODO: Fetch user from database using payload.sub
    // For now, create a mock user from JWT payload
    const user: User = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      permissions: getPermissionsForRole(payload.role),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Set user in context
    c.set('user', user);

    await next();
  } catch (error) {
    logger.warn('Authentication failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      path: c.req.path,
      method: c.req.method,
      ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
    });

    if (error instanceof jwt.JsonWebTokenError) {
      throw new HTTPException(401, {
        message: 'Invalid token',
      });
    }

    if (error instanceof jwt.TokenExpiredError) {
      throw new HTTPException(401, {
        message: 'Token expired',
      });
    }

    throw error;
  }
};

/**
 * Authorization middleware factory
 */
export function requireRole(...roles: UserRole[]): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const user = c.get('user');

    if (!user) {
      throw new HTTPException(401, {
        message: 'Authentication required',
      });
    }

    if (!roles.includes(user.role)) {
      logger.warn('Authorization failed', {
        userId: user.id,
        userRole: user.role,
        requiredRoles: roles,
        path: c.req.path,
        method: c.req.method,
      });

      throw new HTTPException(403, {
        message: 'Insufficient permissions',
      });
    }

    await next();
  };
}

/**
 * Permission-based authorization middleware factory
 */
export function requirePermission(
  ...permissions: string[]
): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const user = c.get('user');

    if (!user) {
      throw new HTTPException(401, {
        message: 'Authentication required',
      });
    }

    const hasPermission = permissions.some(permission =>
      user.permissions.includes(permission)
    );

    if (!hasPermission) {
      logger.warn('Permission check failed', {
        userId: user.id,
        userPermissions: user.permissions,
        requiredPermissions: permissions,
        path: c.req.path,
        method: c.req.method,
      });

      throw new HTTPException(403, {
        message: 'Insufficient permissions',
      });
    }

    await next();
  };
}

/**
 * Optional authentication middleware (doesn't throw if no token)
 */
export const optionalAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
  try {
    const authHeader = c.req.header('Authorization');

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = jwt.verify(token, config.jwt.secret) as JwtPayload;

      const user: User = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        permissions: getPermissionsForRole(payload.role),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      c.set('user', user);
    }
  } catch (error) {
    // Ignore authentication errors for optional auth
    logger.debug('Optional auth failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  await next();
};

/**
 * Get permissions for a user role
 */
function getPermissionsForRole(role: UserRole): string[] {
  switch (role) {
    case UserRole.ADMIN:
      return [
        'users:read',
        'users:write',
        'users:delete',
        'content:read',
        'content:write',
        'content:delete',
        'system:admin',
      ];
    case UserRole.MODERATOR:
      return [
        'users:read',
        'content:read',
        'content:write',
        'content:moderate',
      ];
    case UserRole.USER:
      return ['content:read', 'profile:read', 'profile:write'];
    default:
      return [];
  }
}
