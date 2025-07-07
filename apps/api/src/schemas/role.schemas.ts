import { z } from 'zod';

/**
 * Role management validation schemas
 */

/**
 * Query validation schema for role listing
 */
export const roleQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
  includeInactive: z.string().optional().transform(val => val === 'true'),
  systemRolesOnly: z.string().optional().transform(val => val === 'true'),
});

/**
 * Role creation validation schema
 */
export const createRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(100, 'Role name too long'),
  description: z.string().optional(),
  policyIds: z.array(z.string().uuid('Invalid policy ID format')),
  isSystemRole: z.boolean().optional().default(false),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Role update validation schema
 */
export const updateRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(100, 'Role name too long').optional(),
  description: z.string().optional(),
  policyIds: z.array(z.string().uuid('Invalid policy ID format')).optional(),
  isActive: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Role assignment validation schema
 */
export const assignRoleSchema = z.object({
  userId: z.string().uuid('Invalid user ID format'),
  expiresAt: z.string().datetime().optional(),
});
