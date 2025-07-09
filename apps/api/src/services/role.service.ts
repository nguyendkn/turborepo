import { eq, and, desc, inArray, count } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';

import { db } from '@/config/database';
import { roles, rolePolicies, userRoles, policies } from '@/database/schema';
import type { Role, Policy, PolicyConditions } from '@/types';
import { logger } from '@/utils/logger';

/**
 * Role Service
 * Handles CRUD operations for roles and role assignments
 */
export class RoleService {
  /**
   * Convert database policy result to Policy interface
   */
  private convertToPolicy(dbPolicy: {
    id: string;
    name: string;
    description?: string | null;
    version: number;
    isActive: boolean;
    conditions: unknown;
    actions: unknown;
    resources: unknown;
    effect: string;
    priority: number;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string | null;
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
   * Convert database role result to Role interface
   */
  private convertToRole(
    dbRole: {
      id: string;
      name: string;
      description?: string | null;
      isActive: boolean;
      isSystemRole: boolean;
      metadata?: unknown | null;
      createdAt: Date;
      updatedAt: Date;
      createdBy?: string | null;
    },
    policies: Policy[] = []
  ): Role {
    const result: Role = {
      id: dbRole.id,
      name: dbRole.name,
      description: dbRole.description || '',
      isActive: dbRole.isActive,
      isSystemRole: dbRole.isSystemRole,
      policies,
      metadata: (dbRole.metadata as Record<string, unknown>) || ({} as Record<string, unknown>),
      createdAt: dbRole.createdAt,
      updatedAt: dbRole.updatedAt,
    };

    if (dbRole.createdBy) {
      result.createdBy = dbRole.createdBy;
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
      const offset = (page - 1) * limit;

      const query = db
        .select({
          id: roles.id,
          name: roles.name,
          description: roles.description,
          isActive: roles.isActive,
          isSystemRole: roles.isSystemRole,
          metadata: roles.metadata,
          createdBy: roles.createdBy,
          createdAt: roles.createdAt,
          updatedAt: roles.updatedAt,
        })
        .from(roles);

      const conditions = [];
      if (!includeInactive) {
        conditions.push(eq(roles.isActive, true));
      }
      if (systemRolesOnly) {
        conditions.push(eq(roles.isSystemRole, true));
      }

      if (conditions.length > 0) {
        query.where(and(...conditions));
      }

      const rolesData = await query
        .orderBy(desc(roles.createdAt))
        .limit(limit)
        .offset(offset);

      // Get total count for pagination
      const totalQuery = db.select({ count: count() }).from(roles);

      if (conditions.length > 0) {
        totalQuery.where(and(...conditions));
      }

      const totalResult = await totalQuery;
      const total = totalResult[0]?.count || 0;

      // Get policies for each role
      const rolesWithPolicies = await Promise.all(
        rolesData.map(async role => {
          const rolePoliciesData = await db
            .select({
              id: policies.id,
              name: policies.name,
              description: policies.description,
              version: policies.version,
              isActive: policies.isActive,
              conditions: policies.conditions,
              actions: policies.actions,
              resources: policies.resources,
              effect: policies.effect,
              priority: policies.priority,
              createdBy: policies.createdBy,
              createdAt: policies.createdAt,
              updatedAt: policies.updatedAt,
            })
            .from(policies)
            .innerJoin(rolePolicies, eq(policies.id, rolePolicies.policyId))
            .where(eq(rolePolicies.roleId, role.id));

          const rolePoliciesList = rolePoliciesData.map(p =>
            this.convertToPolicy(p)
          );
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
      const [roleData] = await db
        .select({
          id: roles.id,
          name: roles.name,
          description: roles.description,
          isActive: roles.isActive,
          isSystemRole: roles.isSystemRole,
          metadata: roles.metadata,
          createdBy: roles.createdBy,
          createdAt: roles.createdAt,
          updatedAt: roles.updatedAt,
        })
        .from(roles)
        .where(eq(roles.id, id));

      if (!roleData) {
        return null;
      }

      // Get role policies
      const rolePoliciesData = await db
        .select({
          id: policies.id,
          name: policies.name,
          description: policies.description,
          version: policies.version,
          isActive: policies.isActive,
          conditions: policies.conditions,
          actions: policies.actions,
          resources: policies.resources,
          effect: policies.effect,
          priority: policies.priority,
          createdBy: policies.createdBy,
          createdAt: policies.createdAt,
          updatedAt: policies.updatedAt,
        })
        .from(policies)
        .innerJoin(rolePolicies, eq(policies.id, rolePolicies.policyId))
        .where(eq(rolePolicies.roleId, id));

      const rolePoliciesList = rolePoliciesData.map(p =>
        this.convertToPolicy(p)
      );
      return this.convertToRole(roleData, rolePoliciesList);
    } catch (error) {
      logger.error('Get role by ID failed:', error);
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
    metadata?: Record<string, unknown>;
    createdBy?: string;
  }): Promise<Role> {
    try {
      // Check if role name already exists
      const [existingRole] = await db
        .select({ id: roles.id })
        .from(roles)
        .where(eq(roles.name, roleData.name));

      if (existingRole) {
        throw new HTTPException(409, { message: 'Role name already exists' });
      }

      // Validate that all policy IDs exist
      if (roleData.policyIds.length > 0) {
        const existingPolicies = await db
          .select({ id: policies.id })
          .from(policies)
          .where(inArray(policies.id, roleData.policyIds));

        if (existingPolicies.length !== roleData.policyIds.length) {
          throw new HTTPException(400, {
            message: 'One or more policy IDs are invalid',
          });
        }
      }

      // Create role
      const [newRole] = await db
        .insert(roles)
        .values({
          name: roleData.name,
          description: roleData.description || null,
          isSystemRole: roleData.isSystemRole || false,
          metadata: roleData.metadata || {},
          createdBy: roleData.createdBy || null,
        })
        .returning();

      if (!newRole) {
        throw new HTTPException(500, { message: 'Failed to create role' });
      }

      // Associate policies with role
      if (roleData.policyIds.length > 0) {
        await db.insert(rolePolicies).values(
          roleData.policyIds.map(policyId => ({
            roleId: newRole.id,
            policyId,
          }))
        );
      }

      // Return the created role with policies
      const createdRole = await this.getRoleById(newRole.id);
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
      metadata?: Record<string, unknown>;
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
        const [conflictingRole] = await db
          .select({ id: roles.id })
          .from(roles)
          .where(eq(roles.name, updates.name));

        if (conflictingRole) {
          throw new HTTPException(409, { message: 'Role name already exists' });
        }
      }

      // Validate policy IDs if provided
      if (updates.policyIds && updates.policyIds.length > 0) {
        const existingPolicies = await db
          .select({ id: policies.id })
          .from(policies)
          .where(inArray(policies.id, updates.policyIds));

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
        metadata: Record<string, unknown>;
        updatedAt: Date;
      }> = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.description !== undefined)
        updateData.description = updates.description;
      if (updates.isActive !== undefined)
        updateData.isActive = updates.isActive;
      if (updates.metadata !== undefined)
        updateData.metadata = updates.metadata;

      if (Object.keys(updateData).length > 0) {
        await db.update(roles).set(updateData).where(eq(roles.id, id));
      }

      // Update role policies if provided
      if (updates.policyIds !== undefined) {
        // Remove existing policy associations
        await db.delete(rolePolicies).where(eq(rolePolicies.roleId, id));

        // Add new policy associations
        if (updates.policyIds.length > 0) {
          await db.insert(rolePolicies).values(
            updates.policyIds.map(policyId => ({
              roleId: id,
              policyId,
            }))
          );
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
      const [userAssignment] = await db
        .select({ userId: userRoles.userId })
        .from(userRoles)
        .where(eq(userRoles.roleId, id))
        .limit(1);

      if (userAssignment) {
        throw new HTTPException(400, {
          message:
            'Cannot delete role that is assigned to users. Remove all user assignments first.',
        });
      }

      // Delete role policy associations
      await db.delete(rolePolicies).where(eq(rolePolicies.roleId, id));

      // Delete role
      await db.delete(roles).where(eq(roles.id, id));

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
      const [existingAssignment] = await db
        .select({ id: userRoles.id })
        .from(userRoles)
        .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)));

      if (existingAssignment) {
        throw new HTTPException(409, { message: 'User already has this role' });
      }

      // Create assignment
      await db.insert(userRoles).values({
        userId,
        roleId,
        assignedBy: assignedBy || null,
        expiresAt: expiresAt || null,
      });

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
   * Remove role from user
   */
  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    try {
      await db
        .delete(userRoles)
        .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)));

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
