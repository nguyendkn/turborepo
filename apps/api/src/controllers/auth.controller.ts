import type { Handler } from 'hono';
import { HTTPException } from 'hono/http-exception';

import { authService } from '@/services/auth.service';
import type { AppEnv, ApiResponse } from '@/types';
import { logger } from '@/utils/logger';

/**
 * Authentication controller
 */
export const authController = {
  /**
   * User login
   */
  login: (async c => {
    try {
      const { email, password } = await c.req.json();

      const result = await authService.login(email, password);

      const response: ApiResponse = {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response);
    } catch (error) {
      logger.error('Login failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,

  /**
   * User registration
   */
  register: (async c => {
    try {
      const userData = await c.req.json();

      const result = await authService.register(userData);

      const response: ApiResponse = {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response, 201);
    } catch (error) {
      logger.error('Registration failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,

  /**
   * Refresh access token
   */
  refresh: (async c => {
    try {
      const { refreshToken } = await c.req.json();

      const result = await authService.refreshToken(refreshToken);

      const response: ApiResponse = {
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response);
    } catch (error) {
      logger.error('Token refresh failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,

  /**
   * User logout
   */
  logout: (async c => {
    try {
      const user = c.get('user');
      if (!user) {
        throw new HTTPException(401, { message: 'Authentication required' });
      }

      await authService.logout(user.id);

      const response: ApiResponse = {
        success: true,
        data: { message: 'Logged out successfully' },
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response);
    } catch (error) {
      logger.error('Logout failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,

  /**
   * Request password reset
   */
  forgotPassword: (async c => {
    try {
      const { email } = await c.req.json();

      await authService.forgotPassword(email);

      const response: ApiResponse = {
        success: true,
        data: { message: 'Password reset email sent' },
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response);
    } catch (error) {
      logger.error('Forgot password failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,

  /**
   * Reset password with token
   */
  resetPassword: (async c => {
    try {
      const { token, password } = await c.req.json();

      await authService.resetPassword(token, password);

      const response: ApiResponse = {
        success: true,
        data: { message: 'Password reset successfully' },
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response);
    } catch (error) {
      logger.error('Password reset failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,

  /**
   * Verify email address
   */
  verifyEmail: (async c => {
    try {
      const token = c.req.param('token');

      await authService.verifyEmail(token);

      const response: ApiResponse = {
        success: true,
        data: { message: 'Email verified successfully' },
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response);
    } catch (error) {
      logger.error('Email verification failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,
};
