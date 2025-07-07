import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';

import { policyController } from '@/controllers/policy.controller';
import { requirePermission } from '@/middleware/pbac-auth';
import {
  policyQuerySchema,
  createPolicySchema,
  updatePolicySchema,
  togglePolicyStatusSchema,
} from '@/schemas/policy.schemas';
import type { AppEnv } from '@/types';

/**
 * Policy management routes
 */
export const policyRoutes = new Hono<AppEnv>();

/**
 * GET /policies
 * Get all policies with pagination and filtering
 */
policyRoutes.get(
  '/',
  requirePermission('read', 'policies'),
  zValidator('query', policyQuerySchema),
  policyController.getPolicies
);

/**
 * GET /policies/:id
 * Get policy by ID
 */
policyRoutes.get(
  '/:id',
  requirePermission('read', 'policies'),
  policyController.getPolicyById
);

/**
 * GET /policies/by-name/:name
 * Get policy by name
 */
policyRoutes.get(
  '/by-name/:name',
  requirePermission('read', 'policies'),
  policyController.getPolicyByName
);

/**
 * POST /policies
 * Create new policy
 */
policyRoutes.post(
  '/',
  requirePermission('create', 'policies'),
  zValidator('json', createPolicySchema),
  policyController.createPolicy
);

/**
 * PUT /policies/:id
 * Update policy
 */
policyRoutes.put(
  '/:id',
  requirePermission('update', 'policies'),
  zValidator('json', updatePolicySchema),
  policyController.updatePolicy
);

/**
 * DELETE /policies/:id
 * Delete policy
 */
policyRoutes.delete(
  '/:id',
  requirePermission('delete', 'policies'),
  policyController.deletePolicy
);

/**
 * PATCH /policies/:id/status
 * Toggle policy status (activate/deactivate)
 */
policyRoutes.patch(
  '/:id/status',
  requirePermission('update', 'policies'),
  zValidator('json', togglePolicyStatusSchema),
  policyController.togglePolicyStatus
);
