import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  jsonb,
  integer,
  index,
} from 'drizzle-orm/pg-core';

import { users } from './users';

/**
 * Policies table - defines access control policies
 */
export const policies = pgTable('policies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  description: text('description'),
  version: integer('version').notNull().default(1),
  isActive: boolean('is_active').notNull().default(true),
  conditions: jsonb('conditions').notNull(), // Policy conditions and rules
  actions: jsonb('actions').notNull(), // Allowed actions
  resources: jsonb('resources').notNull(), // Resources this policy applies to
  effect: text('effect').notNull().default('allow'), // 'allow' or 'deny'
  priority: integer('priority').notNull().default(0), // Higher priority = evaluated first
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  createdBy: uuid('created_by').references(() => users.id),
}, (table) => ({
  nameIdx: index('policies_name_idx').on(table.name),
  activeIdx: index('policies_active_idx').on(table.isActive),
  priorityIdx: index('policies_priority_idx').on(table.priority),
}));

/**
 * Dynamic roles table - roles created based on policies
 */
export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  isSystemRole: boolean('is_system_role').notNull().default(false), // System vs user-defined
  metadata: jsonb('metadata'), // Additional role metadata
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  createdBy: uuid('created_by').references(() => users.id),
}, (table) => ({
  nameIdx: index('roles_name_idx').on(table.name),
  activeIdx: index('roles_active_idx').on(table.isActive),
}));

/**
 * Role policies junction table - links roles to policies
 */
export const rolePolicies = pgTable('role_policies', {
  id: uuid('id').primaryKey().defaultRandom(),
  roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  policyId: uuid('policy_id').notNull().references(() => policies.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  roleIdIdx: index('role_policies_role_id_idx').on(table.roleId),
  policyIdIdx: index('role_policies_policy_id_idx').on(table.policyId),
}));

/**
 * User roles junction table - assigns roles to users
 */
export const userRoles = pgTable('user_roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  assignedAt: timestamp('assigned_at').notNull().defaultNow(),
  assignedBy: uuid('assigned_by').references(() => users.id),
  expiresAt: timestamp('expires_at'), // Optional role expiration
}, (table) => ({
  userIdIdx: index('user_roles_user_id_idx').on(table.userId),
  roleIdIdx: index('user_roles_role_id_idx').on(table.roleId),
}));

/**
 * Policy evaluation cache table - caches policy evaluation results for performance
 */
export const policyEvaluationCache = pgTable('policy_evaluation_cache', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  cacheKey: text('cache_key').notNull(), // Generated cache key for the request
  result: boolean('result').notNull(), // Evaluation result
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userCacheKeyIdx: index('policy_cache_user_cache_key_idx').on(table.userId, table.cacheKey),
  createdAtIdx: index('policy_cache_created_at_idx').on(table.createdAt),
}));
