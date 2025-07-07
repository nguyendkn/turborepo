import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { profileController } from '@/controllers/profile.controller';
import {
  updateProfileSchema,
  changePasswordSchema,
} from '@/schemas/profile.schemas';
import type { AppEnv } from '@/types';

/**
 * User profile routes
 */
export const profileRoutes = new Hono<AppEnv>();

/**
 * GET /profile
 * Get current user profile
 */
profileRoutes.get('/', profileController.getProfile);

/**
 * PUT /profile
 * Update current user profile
 */
profileRoutes.put(
  '/',
  zValidator('json', updateProfileSchema),
  profileController.updateProfile
);

/**
 * POST /profile/change-password
 * Change user password
 */
profileRoutes.post(
  '/change-password',
  zValidator('json', changePasswordSchema),
  profileController.changePassword
);

/**
 * POST /profile/upload-avatar
 * Upload user avatar
 */
profileRoutes.post('/upload-avatar', profileController.uploadAvatar);

/**
 * DELETE /profile/avatar
 * Delete user avatar
 */
profileRoutes.delete('/avatar', profileController.deleteAvatar);

/**
 * GET /profile/activity
 * Get user activity log
 */
profileRoutes.get('/activity', profileController.getActivity);

/**
 * POST /profile/deactivate
 * Deactivate user account
 */
profileRoutes.post('/deactivate', profileController.deactivateAccount);
