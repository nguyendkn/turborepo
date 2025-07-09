import { eq, and, desc, asc, like, or } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';

import { db } from '@/config/database';
import { policies } from '@/database/schema';
import type { Policy, PolicyConditions } from '@/types';
import { logger } from '@/utils/logger';

/**
 * Policy Repository Service
 * Manages policy storage, retrieval, and CRUD operations
 */
export class PolicyRepositoryService {
  /**
   * Convert database policy result to Policy interface
   */
  private convertToPolicy(dbPolicy: {
    id: string;
    name: string;
    description?: string;
    version: number;
    isActive: boolean;
    conditions: unknown;
    actions: unknown;
    resources: unknown;
    effect: 'allow' | 'deny';
    priority: number;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
  }): Policy {
    const result: Policy = {
      id: dbPolicy.id,
      name: dbPolicy.name,
      description: dbPolicy.description || '',
      version: dbPolicy.version,
      isActive: dbPolicy.isActive,
      conditions: dbPolicy.conditions as PolicyConditions,
      actions: dbPolicy.actions as string[],
      resources: dbPolicy.resources as string[],
      effect: dbPolicy.effect as 'allow' | 'deny',
      priority: dbPolicy.priority,
      createdAt: dbPolicy.createdAt,
      updatedAt: dbPolicy.updatedAt,
    };

    if (dbPolicy.createdBy) {
      result.createdBy = dbPolicy.createdBy;
    }

    return result;
  }

  /**
   * Create a new policy
   */
  async createPolicy(policyData: {
    name: string;
    description?: string;
    conditions: PolicyConditions;
    actions: string[];
    resources: string[];
    effect?: 'allow' | 'deny';
    priority?: number;
    createdBy?: string;
  }): Promise<Policy> {
    try {
      // Check if policy name already exists
      const [existingPolicy] = await db
        .select({ id: policies.id })
        .from(policies)
        .where(eq(policies.name, policyData.name))
        .limit(1);

      if (existingPolicy) {
        throw new HTTPException(409, { message: 'Policy name already exists' });
      }

      // Create policy
      const [newPolicy] = await db
        .insert(policies)
        .values({
          name: policyData.name,
          description: policyData.description || null,
          conditions: policyData.conditions,
          actions: policyData.actions,
          resources: policyData.resources,
          effect: policyData.effect || 'allow',
          priority: policyData.priority || 0,
          createdBy: policyData.createdBy || null,
        })
        .returning();

      return this.convertToPolicy(newPolicy);
    } catch (error) {
      logger.error('Create policy failed:', error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, { message: 'Failed to create policy' });
    }
  }

  /**
   * Get all policies with filtering and pagination
   */
  async getPolicies(
    options: {
      page?: number;
      limit?: number;
      includeInactive?: boolean;
      effect?: 'allow' | 'deny';
      search?: string;
      sortBy?: 'name' | 'priority' | 'createdAt' | 'updatedAt';
      sortOrder?: 'asc' | 'desc';
    } = {}
  ): Promise<{
    policies: Policy[];
    page: number;
    limit: number;
    total: number;
  }> {
    try {
      const {
        page = 1,
        limit = 20,
        includeInactive = false,
        effect,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = options;

      const offset = (page - 1) * limit;

      // Build where conditions
      const conditions = [];
      if (!includeInactive) {
        conditions.push(eq(policies.isActive, true));
      }
      if (effect) {
        conditions.push(eq(policies.effect, effect));
      }
      if (search) {
        conditions.push(
          or(
            like(policies.name, `%${search}%`),
            like(policies.description, `%${search}%`)
          )
        );
      }

      // Build order by
      const orderByColumn = policies[sortBy];
      const orderByFn = sortOrder === 'asc' ? asc : desc;

      // Get policies
      const whereCondition =
        conditions.length === 0
          ? undefined
          : conditions.length === 1
            ? conditions[0]
            : and(...conditions);

      const query = db.select().from(policies);
      const policyResults = await (
        whereCondition ? query.where(whereCondition) : query
      )
        .orderBy(orderByFn(orderByColumn))
        .limit(limit)
        .offset(offset);

      // Get total count
      const countQuery = db.select({ count: policies.id }).from(policies);
      const countResult = await (whereCondition
        ? countQuery.where(whereCondition)
        : countQuery);
      const count = countResult[0]?.count || '0';

      return {
        policies: policyResults.map(p => this.convertToPolicy(p)),
        page,
        limit,
        total: parseInt(count, 10),
      };
    } catch (error) {
      logger.error('Get policies failed:', error);
      throw new HTTPException(500, { message: 'Failed to retrieve policies' });
    }
  }

  /**
   * Get policy by ID
   */
  async getPolicyById(id: string): Promise<Policy | null> {
    try {
      const [policyData] = await db
        .select()
        .from(policies)
        .where(eq(policies.id, id))
        .limit(1);

      return policyData ? this.convertToPolicy(policyData) : null;
    } catch (error) {
      logger.error('Get policy by ID failed:', error);
      throw new HTTPException(500, { message: 'Failed to retrieve policy' });
    }
  }

  /**
   * Get policy by name
   */
  async getPolicyByName(name: string): Promise<Policy | null> {
    try {
      const [policyData] = await db
        .select()
        .from(policies)
        .where(eq(policies.name, name))
        .limit(1);

      return policyData ? this.convertToPolicy(policyData) : null;
    } catch (error) {
      logger.error('Get policy by name failed:', error);
      throw new HTTPException(500, { message: 'Failed to retrieve policy' });
    }
  }

  /**
   * Update policy
   */
  async updatePolicy(
    id: string,
    updates: {
      name?: string;
      description?: string;
      conditions?: PolicyConditions;
      actions?: string[];
      resources?: string[];
      effect?: 'allow' | 'deny';
      priority?: number;
      isActive?: boolean;
    }
  ): Promise<Policy> {
    try {
      // Check if policy exists
      const existingPolicy = await this.getPolicyById(id);
      if (!existingPolicy) {
        throw new HTTPException(404, { message: 'Policy not found' });
      }

      // Check if new name conflicts with existing policy
      if (updates.name && updates.name !== existingPolicy.name) {
        const [conflictingPolicy] = await db
          .select({ id: policies.id })
          .from(policies)
          .where(eq(policies.name, updates.name))
          .limit(1);

        if (conflictingPolicy) {
          throw new HTTPException(409, {
            message: 'Policy name already exists',
          });
        }
      }

      // Build update data
      const updateData: Partial<{
        name: string;
        description: string;
        conditions: PolicyConditions;
        actions: string[];
        resources: string[];
        effect: 'allow' | 'deny';
        priority: number;
        isActive: boolean;
        updatedAt: Date;
      }> = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined)
        updateData.description = updates.description;
      if (updates.conditions !== undefined)
        updateData.conditions = updates.conditions;
      if (updates.actions !== undefined) updateData.actions = updates.actions;
      if (updates.resources !== undefined)
        updateData.resources = updates.resources;
      if (updates.effect !== undefined) updateData.effect = updates.effect;
      if (updates.priority !== undefined)
        updateData.priority = updates.priority;
      if (updates.isActive !== undefined)
        updateData.isActive = updates.isActive;

      // Increment version
      updateData.version = existingPolicy.version + 1;

      // Update policy
      const [updatedPolicy] = await db
        .update(policies)
        .set(updateData)
        .where(eq(policies.id, id))
        .returning();

      return this.convertToPolicy(updatedPolicy);
    } catch (error) {
      logger.error('Update policy failed:', error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, { message: 'Failed to update policy' });
    }
  }

  /**
   * Delete policy
   */
  async deletePolicy(id: string): Promise<void> {
    try {
      const result = await db
        .delete(policies)
        .where(eq(policies.id, id))
        .returning();

      if (result.length === 0) {
        throw new HTTPException(404, { message: 'Policy not found' });
      }
    } catch (error) {
      logger.error('Delete policy failed:', error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, { message: 'Failed to delete policy' });
    }
  }

  /**
   * Toggle policy status
   */
  async togglePolicyStatus(id: string, isActive: boolean): Promise<Policy> {
    try {
      const [updatedPolicy] = await db
        .update(policies)
        .set({ isActive })
        .where(eq(policies.id, id))
        .returning();

      if (!updatedPolicy) {
        throw new HTTPException(404, { message: 'Policy not found' });
      }

      return this.convertToPolicy(updatedPolicy);
    } catch (error) {
      logger.error('Toggle policy status failed:', error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: 'Failed to toggle policy status',
      });
    }
  }
}

export const policyRepositoryService = new PolicyRepositoryService();
