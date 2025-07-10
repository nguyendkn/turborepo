import { HTTPException } from 'hono/http-exception';

import {
    Policy as PolicyModel,
    Role as RoleModel,
    RolePolicy,
    UserRole,
    type IPolicy,
    type IRole
} from '@/database/models';
import type { Policy, PolicyConditions, Role } from '@/types';
import type { RoleMetadata } from '@/types/database';
import { logger } from '@/utils/logger';

/**
 * Role Service
 * Handles CRUD operations for roles and role assignments
 */
export class RoleService {
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
   * Convert Mongoose role document to Role interface
   */
  private convertToRole(
    dbRole: IRole,
    policies: Policy[] = []
  ): Role {
    const result: Role = {
      id: dbRole._id.toString(),
      name: dbRole.name,
      description: dbRole.description || '',
      isActive: dbRole.isActive,
      isSystemRole: dbRole.isSystemRole,
      policies,
      metadata: (dbRole.metadata as RoleMetadata) || {},
      createdAt: dbRole.createdAt,
      updatedAt: dbRole.updatedAt,
    };

    if (dbRole.createdBy) {
      result.createdBy = dbRole.createdBy.toString();
    }

    return result;
  }

  /**
   * Get all roles with optional filtering
   */
  async getRoles(
    options: {
      page?: number;
      limit?: number;
      includeInactive?: boolean;
      systemRolesOnly?: boolean;
    } = {}
  ) {
    try {
      const {
        page = 1,
        limit = 20,
        includeInactive = false,
        systemRolesOnly = false,
      } = options;
      const skip = (page - 1) * limit;

      // Build filter conditions
      const filterConditions: Record<string, unknown> = {};

      if (!includeInactive) {
        filterConditions.isActive = true;
      }

      if (systemRolesOnly) {
        filterConditions.isSystemRole = true;
      }

      // Get roles with pagination
      const rolesData = await RoleModel.find(filterConditions)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);

      // Get total count for pagination
      const total = await RoleModel.countDocuments(filterConditions);

      // Get policies for each role
      const rolesWithPolicies = await Promise.all(
        rolesData.map(async role => {
          // Get role policies
          const rolePoliciesData = await RolePolicy.find({ roleId: role._id })
            .populate('policyId');

          const rolePoliciesList: Policy[] = [];
          for (const rp of rolePoliciesData) {
            if (rp.policyId && typeof rp.policyId === 'object' && '_id' in rp.policyId) {
              rolePoliciesList.push(this.convertToPolicy(rp.policyId as unknown as IPolicy));
            }
          }

          return this.convertToRole(role, rolePoliciesList);
        })
      );

      return {
        roles: rolesWithPolicies,
        pagination: {
          page,
          limit,
          total: Number(total),
          totalPages: Math.ceil(Number(total) / limit),
        },
      };
    } catch (error) {
      logger.error('Get roles failed:', error);
      throw new HTTPException(500, { message: 'Failed to retrieve roles' });
    }
  }

  /**
   * Get role by ID with policies
   */
  async getRoleById(id: string): Promise<Role | null> {
    try {
      const roleData = await RoleModel.findById(id);

      if (!roleData) {
        return null;
      }

      // Get role policies
      const rolePoliciesData = await RolePolicy.find({ roleId: id })
        .populate('policyId');

      const rolePoliciesList: Policy[] = [];
      for (const rp of rolePoliciesData) {
        if (rp.policyId && typeof rp.policyId === 'object' && '_id' in rp.policyId) {
          rolePoliciesList.push(this.convertToPolicy(rp.policyId as unknown as IPolicy));
        }
      }

      return this.convertToRole(roleData, rolePoliciesList);
    } catch (error) {
      logger.error('Get role by ID failed:', error);
      throw new HTTPException(500, { message: 'Failed to retrieve role' });
    }
  }

  /**
   * Get role by name
   */
  async getRoleByName(name: string): Promise<Role | null> {
    try {
      const roleData = await RoleModel.findOne({ name: name.toLowerCase() });

      if (!roleData) {
        return null;
      }

      // Get role policies
      const rolePoliciesData = await RolePolicy.find({ roleId: roleData._id })
        .populate('policyId');

      const rolePoliciesList: Policy[] = [];
      for (const rp of rolePoliciesData) {
        if (rp.policyId && typeof rp.policyId === 'object' && '_id' in rp.policyId) {
          rolePoliciesList.push(this.convertToPolicy(rp.policyId as unknown as IPolicy));
        }
      }

      return this.convertToRole(roleData, rolePoliciesList);
    } catch (error) {
      logger.error('Get role by name failed:', error);
      throw new HTTPException(500, { message: 'Failed to retrieve role' });
    }
  }

  /**
   * Create new role
   */
  async createRole(roleData: {
    name: string;
    description?: string;
    policyIds: string[];
    isSystemRole?: boolean;
    metadata?: RoleMetadata;
    createdBy?: string;
  }): Promise<Role> {
    try {
      // Check if role name already exists
      const existingRole = await RoleModel.findOne({ name: roleData.name });

      if (existingRole) {
        throw new HTTPException(409, { message: 'Role name already exists' });
      }

      // Validate that all policy IDs exist
      if (roleData.policyIds.length > 0) {
        const existingPolicies = await PolicyModel.find({
          _id: { $in: roleData.policyIds }
        });

        if (existingPolicies.length !== roleData.policyIds.length) {
          throw new HTTPException(400, {
            message: 'One or more policy IDs are invalid',
          });
        }
      }

      // Create role
      const newRole = new RoleModel({
        name: roleData.name,
        description: roleData.description,
        isSystemRole: roleData.isSystemRole || false,
        metadata: roleData.metadata || {},
        createdBy: roleData.createdBy,
      });

      const savedRole = await newRole.save();

      // Associate policies with role
      if (roleData.policyIds.length > 0) {
        const rolePolicyDocs = roleData.policyIds.map(policyId => ({
          roleId: savedRole._id,
          policyId,
        }));

        await RolePolicy.insertMany(rolePolicyDocs);
      }

      // Return the created role with policies
      const createdRole = await this.getRoleById(savedRole._id.toString());
      if (!createdRole) {
        throw new HTTPException(500, {
          message: 'Failed to retrieve created role',
        });
      }

      return createdRole;
    } catch (error) {
      logger.error('Create role failed:', error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, { message: 'Failed to create role' });
    }
  }

  /**
   * Update role
   */
  async updateRole(
    id: string,
    updates: {
      name?: string;
      description?: string;
      policyIds?: string[];
      isActive?: boolean;
      metadata?: RoleMetadata;
    }
  ): Promise<Role> {
    try {
      // Check if role exists
      const existingRole = await this.getRoleById(id);
      if (!existingRole) {
        throw new HTTPException(404, { message: 'Role not found' });
      }

      // Check if new name conflicts with existing role
      if (updates.name && updates.name !== existingRole.name) {
        const conflictingRole = await RoleModel.findOne({ name: updates.name });

        if (conflictingRole) {
          throw new HTTPException(409, { message: 'Role name already exists' });
        }
      }

      // Validate policy IDs if provided
      if (updates.policyIds && updates.policyIds.length > 0) {
        const existingPolicies = await PolicyModel.find({
          _id: { $in: updates.policyIds }
        });

        if (existingPolicies.length !== updates.policyIds.length) {
          throw new HTTPException(400, {
            message: 'One or more policy IDs are invalid',
          });
        }
      }

      // Update role
      const updateData: Partial<{
        name: string;
        description: string;
        isActive: boolean;
        metadata: RoleMetadata;
      }> = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined)
        updateData.description = updates.description;
      if (updates.isActive !== undefined)
        updateData.isActive = updates.isActive;
      if (updates.metadata !== undefined)
        updateData.metadata = updates.metadata;

      if (Object.keys(updateData).length > 0) {
        await RoleModel.findByIdAndUpdate(id, updateData, { runValidators: true });
      }

      // Update role policies if provided
      if (updates.policyIds !== undefined) {
        // Remove existing policy associations
        await RolePolicy.deleteMany({ roleId: id });

        // Add new policy associations
        if (updates.policyIds.length > 0) {
          const rolePolicyDocs = updates.policyIds.map(policyId => ({
            roleId: id,
            policyId,
          }));

          await RolePolicy.insertMany(rolePolicyDocs);
        }
      }

      // Return updated role
      const updatedRole = await this.getRoleById(id);
      if (!updatedRole) {
        throw new HTTPException(500, {
          message: 'Failed to retrieve updated role',
        });
      }

      return updatedRole;
    } catch (error) {
      logger.error('Update role failed:', error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, { message: 'Failed to update role' });
    }
  }

  /**
   * Delete role
   */
  async deleteRole(id: string): Promise<void> {
    try {
      const existingRole = await this.getRoleById(id);
      if (!existingRole) {
        throw new HTTPException(404, { message: 'Role not found' });
      }

      // Check if role is assigned to any users
      const userAssignment = await UserRole.findOne({ roleId: id });

      if (userAssignment) {
        throw new HTTPException(400, {
          message:
            'Cannot delete role that is assigned to users. Remove all user assignments first.',
        });
      }

      // Delete role policy associations
      await RolePolicy.deleteMany({ roleId: id });

      // Delete role
      await RoleModel.findByIdAndDelete(id);

      logger.info('Role deleted', { roleId: id });
    } catch (error) {
      logger.error('Delete role failed:', error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, { message: 'Failed to delete role' });
    }
  }

  /**
   * Assign role to user
   */
  async assignRoleToUser(
    userId: string,
    roleId: string,
    assignedBy?: string,
    expiresAt?: Date
  ): Promise<void> {
    try {
      // Check if role exists
      const role = await this.getRoleById(roleId);
      if (!role) {
        throw new HTTPException(404, { message: 'Role not found' });
      }

      // Check if assignment already exists
      const existingAssignment = await UserRole.findOne({ userId, roleId });

      if (existingAssignment) {
        throw new HTTPException(409, { message: 'User already has this role' });
      }

      // Create assignment
      const userRole = new UserRole({
        userId,
        roleId,
        assignedBy,
        expiresAt,
      });

      await userRole.save();

      logger.info('Role assigned to user', { userId, roleId, assignedBy });
    } catch (error) {
      logger.error('Assign role to user failed:', error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: 'Failed to assign role to user',
      });
    }
  }

  /**
   * Ensure default role exists and create if not
   */
  async ensureDefaultRole(roleName: string): Promise<Role> {
    try {
      logger.debug(`Ensuring default role exists: ${roleName}`);

      // Try to find existing role
      let role = await this.getRoleByName(roleName);

      if (!role) {
        // Create default role if it doesn't exist
        logger.info(`Creating default role: ${roleName}`);

        try {
          // Create role directly without policies for default roles
          const newRole = new RoleModel({
            name: roleName,
            description: `Default ${roleName} role`,
            isSystemRole: true,
            metadata: {},
          });

          const savedRole = await newRole.save();
          logger.debug(`Default role created successfully: ${roleName}`);

          // Convert to Role interface
          role = this.convertToRole(savedRole, []);
        } catch (createError) {
          logger.error(`Failed to create default role '${roleName}':`, createError);
          throw createError;
        }
      } else {
        logger.debug(`Default role already exists: ${roleName}`);
      }

      return role;
    } catch (error) {
      logger.error('Ensure default role failed:', error);
      throw new HTTPException(500, {
        message: `Failed to ensure default role '${roleName}' exists`,
      });
    }
  }

  /**
   * Assign role to user by role name
   */
  async assignRoleToUserByName(
    userId: string,
    roleName: string,
    assignedBy?: string,
    expiresAt?: Date
  ): Promise<void> {
    try {
      // Ensure role exists (create if needed)
      const role = await this.ensureDefaultRole(roleName);

      // Use existing assignRoleToUser method
      await this.assignRoleToUser(userId, role.id, assignedBy, expiresAt);
    } catch (error) {
      logger.error('Assign role to user by name failed:', error);
      if (error instanceof HTTPException) {
        throw error;
      }
      throw new HTTPException(500, {
        message: 'Failed to assign role to user',
      });
    }
  }

  /**
   * Remove role from user
   */
  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    try {
      await UserRole.deleteOne({ userId, roleId });

      logger.info('Role removed from user', { userId, roleId });
    } catch (error) {
      logger.error('Remove role from user failed:', error);
      throw new HTTPException(500, {
        message: 'Failed to remove role from user',
      });
    }
  }
}

export const roleService = new RoleService();
