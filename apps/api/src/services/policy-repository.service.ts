import { HTTPException } from 'hono/http-exception';

import { Policy as PolicyModel, type IPolicy } from '@/database/models';
import type { Policy, PolicyConditions } from '@/types';
import type { PolicyFilterConditions, MongoSortOptions } from '@/types/database';
import { logger } from '@/utils/logger';

/**
 * Policy Repository Service
 * Manages policy storage, retrieval, and CRUD operations
 */
export class PolicyRepositoryService {
  /**
   * Convert Mongoose policy document to Policy interface
   */
  private convertToPolicy(dbPolicy: IPolicy): Policy {
    const result: Policy = {
      id: dbPolicy._id.toString(),
      name: dbPolicy.name,
      description: dbPolicy.description || '',
      version: dbPolicy.version,
      isActive: dbPolicy.isActive,
      conditions: dbPolicy.conditions as PolicyConditions,
      actions: dbPolicy.actions as unknown as string[],
      resources: dbPolicy.resources as unknown as string[],
      effect: dbPolicy.effect,
      priority: dbPolicy.priority,
      createdAt: dbPolicy.createdAt,
      updatedAt: dbPolicy.updatedAt,
    };

    if (dbPolicy.createdBy) {
      result.createdBy = dbPolicy.createdBy.toString();
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
      const existingPolicy = await PolicyModel.findOne({ name: policyData.name });

      if (existingPolicy) {
        throw new HTTPException(409, { message: 'Policy name already exists' });
      }

      // Create policy
      const newPolicy = new PolicyModel({
        name: policyData.name,
        description: policyData.description,
        conditions: policyData.conditions,
        actions: policyData.actions,
        resources: policyData.resources,
        effect: policyData.effect || 'allow',
        priority: policyData.priority || 0,
        createdBy: policyData.createdBy,
      });

      const savedPolicy = await newPolicy.save();
      return this.convertToPolicy(savedPolicy);
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

      const skip = (page - 1) * limit;

      // Build filter conditions
      const filterConditions: PolicyFilterConditions = {};

      if (!includeInactive) {
        filterConditions.isActive = true;
      }

      if (effect) {
        filterConditions.effect = effect;
      }

      if (search) {
        filterConditions.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      // Build sort options
      const sortOptions: MongoSortOptions = {};
      sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Get policies with pagination
      const policyResults = await PolicyModel.find(filterConditions)
        .sort(sortOptions)
        .limit(limit)
        .skip(skip);

      // Get total count
      const total = await PolicyModel.countDocuments(filterConditions);

      return {
        policies: policyResults.map(p => this.convertToPolicy(p)),
        page,
        limit,
        total,
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
      const policyData = await PolicyModel.findById(id);
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
      const policyData = await PolicyModel.findOne({ name });
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
        const conflictingPolicy = await PolicyModel.findOne({ name: updates.name });

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
        version: number;
      }> = { ...updates };

      // Increment version
      updateData.version = existingPolicy.version + 1;

      // Update policy
      const updatedPolicy = await PolicyModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedPolicy) {
        throw new HTTPException(500, { message: 'Failed to update policy' });
      }
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
      const result = await PolicyModel.findByIdAndDelete(id);

      if (!result) {
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
      const updatedPolicy = await PolicyModel.findByIdAndUpdate(
        id,
        { isActive },
        { new: true, runValidators: true }
      );

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
