import type { Handler } from 'hono';
import { HTTPException } from 'hono/http-exception';

import { policyRepositoryService } from '@/services/policy-repository.service';
import type { AppEnv, ApiResponse } from '@/types';
import { logger } from '@/utils/logger';

/**
 * Policy Management Controller
 * Handles CRUD operations for policies
 */
export const policyController = {
  /**
   * Get all policies
   * GET /policies
   */
  getPolicies: (async c => {
    try {
      const query = c.req.query();
      const page = parseInt(query.page || '1');
      const limit = parseInt(query.limit || '20');
      const includeInactive = query.includeInactive === 'true';
      const effect = query.effect as 'allow' | 'deny' | undefined;
      const search = query.search;
      const sortBy = query.sortBy as 'name' | 'priority' | 'createdAt' | 'updatedAt' | undefined;
      const sortOrder = query.sortOrder as 'asc' | 'desc' | undefined;

      const result = await policyRepositoryService.getPolicies({
        page,
        limit,
        includeInactive,
        ...(effect && { effect }),
        ...(search && { search }),
        ...(sortBy && { sortBy }),
        ...(sortOrder && { sortOrder }),
      });

      const response: ApiResponse = {
        success: true,
        data: result.policies,
        meta: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / result.limit),
        },
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response);
    } catch (error) {
      logger.error('Get policies failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,

  /**
   * Get policy by ID
   * GET /policies/:id
   */
  getPolicyById: (async c => {
    try {
      const id = c.req.param('id');
      const policy = await policyRepositoryService.getPolicyById(id);

      if (!policy) {
        throw new HTTPException(404, { message: 'Policy not found' });
      }

      const response: ApiResponse = {
        success: true,
        data: policy,
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response);
    } catch (error) {
      logger.error('Get policy by ID failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,

  /**
   * Create new policy
   * POST /policies
   */
  createPolicy: (async c => {
    try {
      const user = c.get('user');
      const policyData = await c.req.json();

      // Validate required fields
      if (!policyData.name) {
        throw new HTTPException(400, { message: 'Policy name is required' });
      }

      if (!policyData.actions || !Array.isArray(policyData.actions) || policyData.actions.length === 0) {
        throw new HTTPException(400, { message: 'Actions array is required and must not be empty' });
      }

      if (!policyData.resources || !Array.isArray(policyData.resources) || policyData.resources.length === 0) {
        throw new HTTPException(400, { message: 'Resources array is required and must not be empty' });
      }

      const policy = await policyRepositoryService.createPolicy({
        name: policyData.name,
        ...(policyData.description && { description: policyData.description }),
        conditions: policyData.conditions || {},
        actions: policyData.actions,
        resources: policyData.resources,
        effect: policyData.effect || 'allow',
        priority: policyData.priority || 0,
        ...(user?.id && { createdBy: user.id }),
      });

      const response: ApiResponse = {
        success: true,
        data: policy,
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response, 201);
    } catch (error) {
      logger.error('Create policy failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,

  /**
   * Update policy
   * PUT /policies/:id
   */
  updatePolicy: (async c => {
    try {
      const id = c.req.param('id');
      const updates = await c.req.json();

      const policy = await policyRepositoryService.updatePolicy(id, updates);

      const response: ApiResponse = {
        success: true,
        data: policy,
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response);
    } catch (error) {
      logger.error('Update policy failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,

  /**
   * Delete policy
   * DELETE /policies/:id
   */
  deletePolicy: (async c => {
    try {
      const id = c.req.param('id');
      await policyRepositoryService.deletePolicy(id);

      const response: ApiResponse = {
        success: true,
        data: { message: 'Policy deleted successfully' },
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response);
    } catch (error) {
      logger.error('Delete policy failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,

  /**
   * Toggle policy status (activate/deactivate)
   * PATCH /policies/:id/status
   */
  togglePolicyStatus: (async c => {
    try {
      const id = c.req.param('id');
      const { isActive } = await c.req.json();

      if (typeof isActive !== 'boolean') {
        throw new HTTPException(400, { message: 'isActive must be a boolean' });
      }

      const policy = await policyRepositoryService.togglePolicyStatus(id, isActive);

      const response: ApiResponse = {
        success: true,
        data: policy,
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response);
    } catch (error) {
      logger.error('Toggle policy status failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,

  /**
   * Get policy by name
   * GET /policies/by-name/:name
   */
  getPolicyByName: (async c => {
    try {
      const name = c.req.param('name');
      const policy = await policyRepositoryService.getPolicyByName(name);

      if (!policy) {
        throw new HTTPException(404, { message: 'Policy not found' });
      }

      const response: ApiResponse = {
        success: true,
        data: policy,
        timestamp: new Date().toISOString(),
        requestId: c.get('requestId'),
      };

      return c.json(response);
    } catch (error) {
      logger.error('Get policy by name failed:', error);
      throw error;
    }
  }) as Handler<AppEnv>,
};
