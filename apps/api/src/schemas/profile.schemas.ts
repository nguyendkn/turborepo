import { z } from 'zod';

/**
 * User profile validation schemas
 */

/**
 * Update profile validation schema
 */
export const updateProfileSchema = z.object({
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
export const changePasswordSchema = z
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
