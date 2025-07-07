import { z } from 'zod';

/**
 * Policy management validation schemas
 */

/**
 * Query validation schema for policy listing
 */
export const policyQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 20),
  includeInactive: z.string().optional().transform(val => val === 'true'),
  effect: z.enum(['allow', 'deny']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'priority', 'createdAt', 'updatedAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

/**
 * Policy conditions validation schema
 */
export const policyConditionsSchema = z.object({
  user: z.object({
    attributes: z.record(z.unknown()).optional(),
  }).optional(),
  resource: z.object({
    attributes: z.record(z.unknown()).optional(),
  }).optional(),
  environment: z.object({
    timeRange: z.object({
      start: z.string().optional(),
      end: z.string().optional(),
    }).optional(),
    ipWhitelist: z.array(z.string()).optional(),
    ipBlacklist: z.array(z.string()).optional(),
    location: z.array(z.string()).optional(),
  }).optional(),
  custom: z.record(z.unknown()).optional(),
});

/**
 * Policy creation validation schema
 */
export const createPolicySchema = z.object({
  name: z.string().min(1, 'Policy name is required').max(100, 'Policy name too long'),
  description: z.string().optional(),
  conditions: policyConditionsSchema.optional().default({}),
  actions: z.array(z.string().min(1, 'Action cannot be empty')).min(1, 'At least one action is required'),
  resources: z.array(z.string().min(1, 'Resource cannot be empty')).min(1, 'At least one resource is required'),
  effect: z.enum(['allow', 'deny']).optional().default('allow'),
  priority: z.number().int().min(0).optional().default(0),
});

/**
 * Policy update validation schema
 */
export const updatePolicySchema = z.object({
  name: z.string().min(1, 'Policy name is required').max(100, 'Policy name too long').optional(),
  description: z.string().optional(),
  conditions: policyConditionsSchema.optional(),
  actions: z.array(z.string().min(1, 'Action cannot be empty')).min(1, 'At least one action is required').optional(),
  resources: z.array(z.string().min(1, 'Resource cannot be empty')).min(1, 'At least one resource is required').optional(),
  effect: z.enum(['allow', 'deny']).optional(),
  priority: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

/**
 * Policy status toggle validation schema
 */
export const togglePolicyStatusSchema = z.object({
  isActive: z.boolean(),
});
