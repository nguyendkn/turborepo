import { z } from 'zod';

/**
 * User database validation schemas
 */

/**
 * User creation schema for database operations
 */
export const userCreateSchema = z.object({
  email: z.string().email('Invalid email format'),
  passwordHash: z.string().min(1, 'Password hash is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  isActive: z.boolean().optional().default(true),
  emailVerified: z.boolean().optional().default(false),
  emailVerifiedAt: z.date().optional(),
  lastLoginAt: z.date().optional(),
});

/**
 * User update schema for database operations
 */
export const userUpdateSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  passwordHash: z.string().min(1, 'Password hash is required').optional(),
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  isActive: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
  emailVerifiedAt: z.date().optional(),
  lastLoginAt: z.date().optional(),
});

/**
 * User query schema for database operations
 */
export const userQuerySchema = z.object({
  email: z.string().email().optional(),
  isActive: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
  createdAt: z.object({
    gte: z.date().optional(),
    lte: z.date().optional(),
  }).optional(),
  lastLoginAt: z.object({
    gte: z.date().optional(),
    lte: z.date().optional(),
  }).optional(),
});

/**
 * User aggregation schema for database operations
 */
export const userAggregationSchema = z.object({
  groupBy: z.enum(['isActive', 'emailVerified', 'createdAt', 'lastLoginAt']).optional(),
  dateRange: z.object({
    start: z.date(),
    end: z.date(),
  }).optional(),
  includeDeleted: z.boolean().optional().default(false),
});

/**
 * User sort schema for database operations
 */
export const userSortSchema = z.object({
  field: z.enum(['email', 'firstName', 'lastName', 'createdAt', 'updatedAt', 'lastLoginAt']),
  direction: z.enum(['asc', 'desc']).default('asc'),
});

/**
 * User pagination schema for database operations
 */
export const userPaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).optional(),
});

/**
 * User search schema for database operations
 */
export const userSearchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  fields: z.array(z.enum(['email', 'firstName', 'lastName'])).optional().default(['email', 'firstName', 'lastName']),
  caseSensitive: z.boolean().optional().default(false),
});

/**
 * User validation result types
 */
export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type UserQueryInput = z.infer<typeof userQuerySchema>;
export type UserAggregationInput = z.infer<typeof userAggregationSchema>;
export type UserSortInput = z.infer<typeof userSortSchema>;
export type UserPaginationInput = z.infer<typeof userPaginationSchema>;
export type UserSearchInput = z.infer<typeof userSearchSchema>;
