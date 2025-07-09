import type { MiddlewareHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import jwt from 'jsonwebtoken';

import { config } from '@/config/app';
import { userRepository } from '@/repositories/user.repository';
import { permissionEvaluatorService } from '@/services/permission-evaluator.service';
import type { AppEnv, JwtPayload, User } from '@/types';
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

    // Fetch user from database
    const dbUser = await userRepository.findById(payload.sub);
    if (!dbUser || !dbUser.isActive) {
      throw new HTTPException(401, { message: 'User not found or inactive' });
    }

    // Get user roles from PBAC system
    const userRoles = await permissionEvaluatorService.getUserRoles(
      payload.sub
    );

    const user: User = {
      id: dbUser.id,
      email: dbUser.email,
      firstName: dbUser.firstName,
      lastName: dbUser.lastName,
      roles: userRoles,
      isActive: dbUser.isActive,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt,
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
 * Authorization middleware factory for role-based access
 */
export function requireRole(...roles: string[]): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    const user = c.get('user');

    if (!user) {
      throw new HTTPException(401, {
        message: 'Authentication required',
      });
    }

    const userRoleNames = user.roles.map((role: { name: string }) => role.name);
    const hasRequiredRole = roles.some(role => userRoleNames.includes(role));

    if (!hasRequiredRole) {
      logger.warn('Authorization failed', {
        userId: user.id,
        userRoles: userRoleNames,
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
