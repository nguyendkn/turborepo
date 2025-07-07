import { z } from 'zod';

/**
 * User management validation schemas
 */

/**
 * Query parameters validation schema for user listing
 */
export const userQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z
    .string()
    .transform(Number)
    .pipe(z.number().min(1).max(100))
    .optional(),
  search: z.string().optional(),
  isActive: z
    .string()
    .transform(val => val === 'true')
    .optional(),
  sortBy: z
    .enum(['createdAt', 'updatedAt', 'email', 'firstName', 'lastName'])
    .optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

/**
 * User creation validation schema
 */
export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  isActive: z.boolean().optional(),
});

/**
 * User update validation schema
 */
export const updateUserSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  isActive: z.boolean().optional(),
});

/**
 * User role assignment validation schema
 */
export const assignUserRoleSchema = z.object({
  roleId: z.string().uuid('Invalid role ID format'),
  expiresAt: z.string().datetime().optional(),
});
