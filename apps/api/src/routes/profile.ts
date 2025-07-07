import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { profileController } from '@/controllers/profile.controller';
import type { AppEnv } from '@/types/app';

/**
 * User profile routes
 */
export const profileRoutes = new Hono<AppEnv>();

/**
 * Update profile validation schema
 */
const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  preferences: z
    .object({
      theme: z.enum(['light', 'dark']).optional(),
      language: z.string().optional(),
      notifications: z
        .object({
          email: z.boolean().optional(),
          push: z.boolean().optional(),
          sms: z.boolean().optional(),
        })
        .optional(),
    })
    .optional(),
});

/**
 * Change password validation schema
 */
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(6, 'New password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

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
