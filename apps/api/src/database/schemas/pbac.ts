import { z } from 'zod';

/**
 * PBAC (Policy-Based Access Control) database validation schemas
 */

/**
 * Policy conditions schema for database operations
 */
export const policyConditionsSchema = z.object({
  user: z.object({
    attributes: z.record(z.unknown()).optional(),
    groups: z.array(z.string()).optional(),
  }).optional(),
  resource: z.object({
    type: z.string().optional(),
    attributes: z.record(z.unknown()).optional(),
  }).optional(),
  environment: z.record(z.unknown()).optional(),
  custom: z.record(z.unknown()).optional(),
});

/**
 * Policy creation schema for database operations
 */
export const policyCreateSchema = z.object({
  name: z.string().min(1, 'Policy name is required').max(100, 'Policy name too long'),
  description: z.string().optional(),
  version: z.number().int().min(1).default(1),
  isActive: z.boolean().default(true),
  conditions: policyConditionsSchema.default({}),
  actions: z.array(z.string().min(1, 'Action cannot be empty')).min(1, 'At least one action is required'),
  resources: z.array(z.string().min(1, 'Resource cannot be empty')).min(1, 'At least one resource is required'),
  effect: z.enum(['allow', 'deny']).default('allow'),
  priority: z.number().int().min(0).default(0),
  createdBy: z.string().optional(),
});

/**
 * Policy update schema for database operations
 */
export const policyUpdateSchema = z.object({
  name: z.string().min(1, 'Policy name is required').max(100, 'Policy name too long').optional(),
  description: z.string().optional(),
  version: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
  conditions: policyConditionsSchema.optional(),
  actions: z.array(z.string().min(1, 'Action cannot be empty')).min(1, 'At least one action is required').optional(),
  resources: z.array(z.string().min(1, 'Resource cannot be empty')).min(1, 'At least one resource is required').optional(),
  effect: z.enum(['allow', 'deny']).optional(),
  priority: z.number().int().min(0).optional(),
});

/**
 * Role creation schema for database operations
 */
export const roleCreateSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(50, 'Role name too long'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  permissions: z.array(z.string()).default([]),
  createdBy: z.string().optional(),
});

/**
 * Role update schema for database operations
 */
export const roleUpdateSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(50, 'Role name too long').optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  permissions: z.array(z.string()).optional(),
});

/**
 * Permission schema for database operations
 */
export const permissionSchema = z.object({
  name: z.string().min(1, 'Permission name is required'),
  description: z.string().optional(),
  resource: z.string().min(1, 'Resource is required'),
  action: z.string().min(1, 'Action is required'),
  conditions: policyConditionsSchema.optional(),
});

/**
 * User role assignment schema for database operations
 */
export const userRoleAssignmentSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  roleId: z.string().min(1, 'Role ID is required'),
  assignedBy: z.string().optional(),
  expiresAt: z.date().optional(),
});

/**
 * Role policy assignment schema for database operations
 */
export const rolePolicyAssignmentSchema = z.object({
  roleId: z.string().min(1, 'Role ID is required'),
  policyId: z.string().min(1, 'Policy ID is required'),
  assignedBy: z.string().optional(),
});

/**
 * Policy evaluation context schema
 */
export const policyEvaluationContextSchema = z.object({
  user: z.object({
    id: z.string(),
    attributes: z.record(z.unknown()).optional(),
    roles: z.array(z.string()).optional(),
    groups: z.array(z.string()).optional(),
  }),
  resource: z.object({
    type: z.string(),
    id: z.string().optional(),
    attributes: z.record(z.unknown()).optional(),
  }),
  action: z.string(),
  environment: z.record(z.unknown()).optional(),
});

/**
 * Policy evaluation result schema
 */
export const policyEvaluationResultSchema = z.object({
  decision: z.enum(['allow', 'deny', 'not_applicable']),
  policies: z.array(z.object({
    id: z.string(),
    name: z.string(),
    effect: z.enum(['allow', 'deny']),
    priority: z.number(),
  })),
  reason: z.string().optional(),
  evaluatedAt: z.date(),
});

/**
 * PBAC query schema for database operations
 */
export const pbacQuerySchema = z.object({
  entityType: z.enum(['policy', 'role', 'permission', 'user_role', 'role_policy']),
  filters: z.record(z.unknown()).optional(),
  includeInactive: z.boolean().default(false),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

/**
 * PBAC validation result types
 */
export type PolicyConditionsInput = z.infer<typeof policyConditionsSchema>;
export type PolicyCreateInput = z.infer<typeof policyCreateSchema>;
export type PolicyUpdateInput = z.infer<typeof policyUpdateSchema>;
export type RoleCreateInput = z.infer<typeof roleCreateSchema>;
export type RoleUpdateInput = z.infer<typeof roleUpdateSchema>;
export type PermissionInput = z.infer<typeof permissionSchema>;
export type UserRoleAssignmentInput = z.infer<typeof userRoleAssignmentSchema>;
export type RolePolicyAssignmentInput = z.infer<typeof rolePolicyAssignmentSchema>;
export type PolicyEvaluationContextInput = z.infer<typeof policyEvaluationContextSchema>;
export type PolicyEvaluationResultInput = z.infer<typeof policyEvaluationResultSchema>;
export type PbacQueryInput = z.infer<typeof pbacQuerySchema>;
