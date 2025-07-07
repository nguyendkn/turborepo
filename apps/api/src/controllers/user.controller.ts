import type { Handler } from 'hono';
import { HTTPException } from 'hono/http-exception';

import { userService } from '@/services/user.service';
import type { AppEnv, ApiResponse } from '@/types';
import { logger } from '@/utils/logger';

/**
 * User management controller
 */
export const userController = {
  /**
   * Get all users
   */
  getUsers: (async c => {
    try {
      const query = c.req.query();
      const result = await userService.getUsers(query);

      const response: ApiResponse = {
        success: true,
        data: result.users,
        meta: {
          page: result.pagination.page,
          limit: result.pagination.limit,
          total: result.pagination.total,
          totalPages: result.pagination.totalPages,
        },
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response);
    } catch (error) {
      logger.error('Get users failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,

  /**
   * Get user by ID
   */
  getUserById: (async c => {
    try {
      const id = c.req.param('id');
      const user = await userService.getUserById(id);

      if (!user) {
        throw new HTTPException(404, { message: 'User not found' });
      }

      const response: ApiResponse = {
        success: true,
        data: user,
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response);
    } catch (error) {
      logger.error('Get user by ID failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,

  /**
   * Create new user
   */
  createUser: (async c => {
    try {
      const userData = await c.req.json();
      const user = await userService.createUser(userData);

      const response: ApiResponse = {
        success: true,
        data: user,
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response, 201);
    } catch (error) {
      logger.error('Create user failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,

  /**
   * Update user
   */
  updateUser: (async c => {
    try {
      const id = c.req.param('id');
      const userData = await c.req.json();

      const user = await userService.updateUser(id, userData);

      if (!user) {
        throw new HTTPException(404, { message: 'User not found' });
      }

      const response: ApiResponse = {
        success: true,
        data: user,
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response);
    } catch (error) {
      logger.error('Update user failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,

  /**
   * Delete user
   */
  deleteUser: (async c => {
    try {
      const id = c.req.param('id');
      const success = await userService.deleteUser(id);

      if (!success) {
        throw new HTTPException(404, { message: 'User not found' });
      }

      const response: ApiResponse = {
        success: true,
        data: { message: 'User deleted successfully' },
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response);
    } catch (error) {
      logger.error('Delete user failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,

  /**
   * Activate user account
   */
  activateUser: (async c => {
    try {
      const id = c.req.param('id');
      const user = await userService.activateUser(id);

      if (!user) {
        throw new HTTPException(404, { message: 'User not found' });
      }

      const response: ApiResponse = {
        success: true,
        data: user,
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response);
    } catch (error) {
      logger.error('Activate user failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,

  /**
   * Deactivate user account
   */
  deactivateUser: (async c => {
    try {
      const id = c.req.param('id');
      const user = await userService.deactivateUser(id);

      if (!user) {
        throw new HTTPException(404, { message: 'User not found' });
      }

      const response: ApiResponse = {
        success: true,
        data: user,
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response);
    } catch (error) {
      logger.error('Deactivate user failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,

  /**
   * Reset user password
   */
  resetUserPassword: (async c => {
    try {
      const id = c.req.param('id');
      const newPassword = await userService.resetUserPassword(id);

      const response: ApiResponse = {
        success: true,
        data: {
          message: 'Password reset successfully',
          temporaryPassword: newPassword,
        },
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response);
    } catch (error) {
      logger.error('Reset user password failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,
};
