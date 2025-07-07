import type { Handler } from 'hono';
import { HTTPException } from 'hono/http-exception';

import { profileService } from '@/services/profile.service';
import type { AppEnv, ApiResponse } from '@/types/app';
import { logger } from '@/utils/logger';

/**
 * User profile controller
 */
export const profileController = {
  /**
   * Get current user profile
   */
  getProfile: (async c => {
    try {
      const user = c.get('user');
      if (!user) {
        throw new HTTPException(401, { message: 'Authentication required' });
      }

      const profile = await profileService.getProfile(user.id);

      const response: ApiResponse = {
        success: true,
        data: profile,
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response);
    } catch (error) {
      logger.error('Get profile failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,

  /**
   * Update current user profile
   */
  updateProfile: (async c => {
    try {
      const user = c.get('user');
      if (!user) {
        throw new HTTPException(401, { message: 'Authentication required' });
      }

      const profileData = await c.req.json();
      const profile = await profileService.updateProfile(user.id, profileData);

      const response: ApiResponse = {
        success: true,
        data: profile,
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response);
    } catch (error) {
      logger.error('Update profile failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,

  /**
   * Change user password
   */
  changePassword: (async c => {
    try {
      const user = c.get('user');
      if (!user) {
        throw new HTTPException(401, { message: 'Authentication required' });
      }

      const { currentPassword, newPassword } = await c.req.json();
      await profileService.changePassword(
        user.id,
        currentPassword,
        newPassword
      );

      const response: ApiResponse = {
        success: true,
        data: { message: 'Password changed successfully' },
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response);
    } catch (error) {
      logger.error('Change password failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,

  /**
   * Upload user avatar
   */
  uploadAvatar: (async c => {
    try {
      const user = c.get('user');
      if (!user) {
        throw new HTTPException(401, { message: 'Authentication required' });
      }

      // TODO: Implement file upload logic
      const response: ApiResponse = {
        success: true,
        data: { message: 'Avatar upload not implemented yet' },
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response);
    } catch (error) {
      logger.error('Upload avatar failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,

  /**
   * Delete user avatar
   */
  deleteAvatar: (async c => {
    try {
      const user = c.get('user');
      if (!user) {
        throw new HTTPException(401, { message: 'Authentication required' });
      }

      await profileService.deleteAvatar(user.id);

      const response: ApiResponse = {
        success: true,
        data: { message: 'Avatar deleted successfully' },
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response);
    } catch (error) {
      logger.error('Delete avatar failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,

  /**
   * Get user activity log
   */
  getActivity: (async c => {
    try {
      const user = c.get('user');
      if (!user) {
        throw new HTTPException(401, { message: 'Authentication required' });
      }

      const query = c.req.query();
      const activity = await profileService.getActivity(user.id, query);

      const response: ApiResponse = {
        success: true,
        data: activity,
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response);
    } catch (error) {
      logger.error('Get activity failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,

  /**
   * Deactivate user account
   */
  deactivateAccount: (async c => {
    try {
      const user = c.get('user');
      if (!user) {
        throw new HTTPException(401, { message: 'Authentication required' });
      }

      await profileService.deactivateAccount(user.id);

      const response: ApiResponse = {
        success: true,
        data: { message: 'Account deactivated successfully' },
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response);
    } catch (error) {
      logger.error('Deactivate account failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,
};
