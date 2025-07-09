import { eq, and, gte } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';

import { policyEngineService } from './policy-engine.service';

import { db } from '@/config/database';
import {
  policyEvaluationCache,
  roles,
  rolePolicies,
  userRoles,
  policies,
} from '@/database/schema';
import type {
  PolicyEvaluationContext,
  PolicyEvaluationResult,
  PermissionRequest,
  User,
  Role,
  Policy,
  PolicyConditions,
} from '@/types';
import { logger } from '@/utils/logger';

// Database result types
interface DbPolicy {
  id: string;
  name: string | null;
  description?: string | null;
  version: number | null;
  isActive: boolean;
  conditions: unknown;
  actions: unknown;
  resources: unknown;
  effect: string | null;
  priority: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  createdBy?: string | null;
}

interface DbRole {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  isSystemRole: boolean;
  metadata?: unknown | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
}

/**
 * Permission Evaluator Service
 * Evaluates user permissions based on their roles and policies
 */
export class PermissionEvaluatorService {
  private readonly cacheExpirationMinutes = 15; // Cache results for 15 minutes

  /**
   * Check if user has permission to perform an action on a resource
   */
  async hasPermission(
    user: User,
    request: PermissionRequest,
    context?: {
      ipAddress?: string;
      userAgent?: string;
      location?: string;
    }
  ): Promise<boolean> {
    logger.debug('Evaluating permission', {
      userId: user.id,
      action: request.action,
      resource: request.resource,
    });

    // Check cache first
    const cachedResult = await this.getCachedResult(user.id, request);
    if (cachedResult !== null) {
      logger.debug('Using cached permission result', {
        userId: user.id,
        result: cachedResult,
      });
      return cachedResult;
    }

    // Get user roles and their policies
    const userRoles = await this.getUserRoles(user.id);
    const allPolicies = userRoles.flatMap(role => role.policies);

    if (allPolicies.length === 0) {
      logger.debug('No policies found for user', { userId: user.id });
      await this.cacheResult(user.id, request, false);
      return false;
    }

    // Build evaluation context
    const evaluationContext: PolicyEvaluationContext = {
      user: {
        id: user.id,
        email: user.email,
        attributes: {
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive,
        },
      },
      resource: {
        type: request.resource,
        ...(request.resourceId && { id: request.resourceId }),
        attributes: request.context || {},
      },
      action: request.action,
      environment: {
        timestamp: new Date(),
        ...(context?.ipAddress && { ipAddress: context.ipAddress }),
        ...(context?.userAgent && { userAgent: context.userAgent }),
        ...(context?.location && { location: context.location }),
      },
      request: {
        action: request.action,
        resource: request.resource,
        ...(request.resourceId && { resourceId: request.resourceId }),
      },
    };

    // Evaluate policies
    let hasPermission = false;
    for (const policy of allPolicies.sort((a, b) => b.priority - a.priority)) {
      if (!policy.isActive) continue;

      const evaluation = await policyEngineService.evaluatePolicy(
        policy,
        evaluationContext
      );

      if (evaluation.decision === 'allow') {
        hasPermission = true;
        break; // Allow takes precedence
      } else if (evaluation.decision === 'deny') {
        hasPermission = false;
        break; // Explicit deny overrides any allow
      }
    }

    // Cache result
    await this.cacheResult(user.id, request, hasPermission);

    logger.debug('Permission evaluation completed', {
      userId: user.id,
      hasPermission,
    });

    return hasPermission;
  }

  /**
   * Evaluate permission with detailed result
   */
  async evaluatePermission(
    user: User,
    request: PermissionRequest,
    context?: {
      ipAddress?: string;
      userAgent?: string;
      location?: string;
    }
  ): Promise<PolicyEvaluationResult> {
    logger.debug('Detailed permission evaluation', {
      userId: user.id,
      action: request.action,
      resource: request.resource,
    });

    // Get user roles and their policies
    const userRoles = await this.getUserRoles(user.id);
    const allPolicies = userRoles.flatMap(role => role.policies);

    // Build evaluation context
    const evaluationContext: PolicyEvaluationContext = {
      user: {
        id: user.id,
        email: user.email,
        attributes: {
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive,
        },
      },
      resource: {
        type: request.resource,
        ...(request.resourceId && { id: request.resourceId }),
        attributes: request.context || {},
      },
      action: request.action,
      environment: {
        timestamp: new Date(),
        ...(context?.ipAddress && { ipAddress: context.ipAddress }),
        ...(context?.userAgent && { userAgent: context.userAgent }),
        ...(context?.location && { location: context.location }),
      },
      request: {
        action: request.action,
        resource: request.resource,
        ...(request.resourceId && { resourceId: request.resourceId }),
      },
    };

    const policyEvaluations = [];
    let finalDecision: 'allow' | 'deny' | 'not_applicable' = 'not_applicable';

    // Evaluate each policy
    for (const policy of allPolicies.sort((a, b) => b.priority - a.priority)) {
      if (!policy.isActive) continue;

      const evaluation = await policyEngineService.evaluatePolicy(
        policy,
        evaluationContext
      );

      policyEvaluations.push({
        policy: policy,
        effect: (evaluation.decision === 'allow' ? 'allow' : 'deny') as
          | 'allow'
          | 'deny',
        matched: evaluation.decision !== 'not_applicable',
        policyId: policy.id,
        policyName: policy.name,
        decision: evaluation.decision,
        reason: evaluation.reason,
        matchedConditions: evaluation.matchedConditions,
      });

      if (
        evaluation.decision === 'allow' &&
        finalDecision === 'not_applicable'
      ) {
        finalDecision = 'allow';
      } else if (evaluation.decision === 'deny') {
        finalDecision = 'deny';
        break; // Explicit deny overrides any allow
      }
    }

    return {
      allowed: finalDecision === 'allow',
      decision: finalDecision,
      policies: policyEvaluations.map(pe => ({
        policy: pe.policy,
        effect: pe.effect,
        matched: pe.matched,
      })),
      reason: `Evaluated ${policyEvaluations.length} policies`,
      matchedConditions: [],
    };
  }

  /**
   * Check multiple permissions at once
   */
  async checkMultiplePermissions(
    user: User,
    requests: PermissionRequest[],
    context?: {
      ipAddress?: string;
      userAgent?: string;
      location?: string;
    }
  ): Promise<Array<{ request: PermissionRequest; hasPermission: boolean }>> {
    const results = await Promise.all(
      requests.map(async request => ({
        request,
        hasPermission: await this.hasPermission(user, request, context),
      }))
    );

    return results;
  }

  /**
   * Get all permissions for a user
   */
  async getUserPermissions(userId: string): Promise<{
    roles: Array<{
      id: string;
      name: string;
      policies: Array<{
        id: string;
        name: string;
        actions: string[];
        resources: string[];
        effect: 'allow' | 'deny';
      }>;
    }>;
  }> {
    const userRoles = await this.getUserRoles(userId);

    return {
      roles: userRoles.map(role => ({
        id: role.id,
        name: role.name,
        policies: role.policies.map(policy => ({
          id: policy.id,
          name: policy.name,
          actions: policy.actions,
          resources: policy.resources,
          effect: policy.effect,
        })),
      })),
    };
  }

  /**
   * Clear user permission cache
   */
  async clearUserCache(userId: string): Promise<void> {
    try {
      await db
        .delete(policyEvaluationCache)
        .where(eq(policyEvaluationCache.userId, userId));

      logger.debug('Cleared permission cache for user', { userId });
    } catch (error) {
      logger.error('Failed to clear user cache:', error);
    }
  }

  /**
   * Get cached permission result
   */
  private async getCachedResult(
    userId: string,
    request: PermissionRequest
  ): Promise<boolean | null> {
    try {
      const cacheKey = this.generateCacheKey(request);
      const expirationTime = new Date(
        Date.now() - this.cacheExpirationMinutes * 60 * 1000
      );

      const [cachedResult] = await db
        .select({ result: policyEvaluationCache.result })
        .from(policyEvaluationCache)
        .where(
          and(
            eq(policyEvaluationCache.userId, userId),
            eq(policyEvaluationCache.cacheKey, cacheKey),
            gte(policyEvaluationCache.createdAt, expirationTime)
          )
        )
        .limit(1);

      return cachedResult ? cachedResult.result : null;
    } catch (error) {
      logger.error('Failed to get cached result:', error);
      return null;
    }
  }

  /**
   * Cache permission result
   */
  private async cacheResult(
    userId: string,
    request: PermissionRequest,
    result: boolean
  ): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey(request);

      // Delete existing cache entry
      await db
        .delete(policyEvaluationCache)
        .where(
          and(
            eq(policyEvaluationCache.userId, userId),
            eq(policyEvaluationCache.cacheKey, cacheKey)
          )
        );

      // Insert new cache entry
      await db.insert(policyEvaluationCache).values({
        userId,
        cacheKey,
        result,
      });
    } catch (error) {
      logger.error('Failed to cache result:', error);
    }
  }

  /**
   * Generate cache key for permission request
   */
  private generateCacheKey(request: PermissionRequest): string {
    const parts = [
      request.action,
      request.resource,
      request.resourceId || '',
      JSON.stringify(request.context || {}),
    ];
    return parts.join('|');
  }

  // ===== ROLE MANAGEMENT METHODS =====

  /**
   * Convert database policy result to Policy interface
   */
  private convertToPolicy(dbPolicy: DbPolicy): Policy {
    const result: Policy = {
      id: dbPolicy.id,
      name: dbPolicy.name || '',
      description: dbPolicy.description || '',
      version: dbPolicy.version || 1,
      isActive: dbPolicy.isActive,
      conditions: dbPolicy.conditions as PolicyConditions,
      actions: dbPolicy.actions as string[],
      resources: dbPolicy.resources as string[],
      effect: (dbPolicy.effect as 'allow' | 'deny') || 'allow',
      priority: dbPolicy.priority || 0,
      createdAt: dbPolicy.createdAt || new Date(),
      updatedAt: dbPolicy.updatedAt || new Date(),
    };

    if (dbPolicy.createdBy) {
      result.createdBy = dbPolicy.createdBy;
    }

    return result;
  }

  /**
   * Convert database role result to Role interface
   */
  private convertToRole(dbRole: DbRole, policies: Policy[] = []): Role {
    const result: Role = {
      id: dbRole.id,
      name: dbRole.name,
      description: dbRole.description || '',
      isActive: dbRole.isActive,
      isSystemRole: dbRole.isSystemRole,
      policies,
      metadata: (dbRole.metadata as Record<string, unknown>) || {},
      createdAt: dbRole.createdAt,
      updatedAt: dbRole.updatedAt,
    };

    if (dbRole.createdBy) {
      result.createdBy = dbRole.createdBy;
    }

    return result;
  }

  /**
   * Get user roles with their associated policies
   */
  async getUserRoles(userId: string): Promise<Role[]> {
    try {
      const userRoleData = await db
        .select({
          roleId: userRoles.roleId,
          roleName: roles.name,
          roleDescription: roles.description,
          roleIsActive: roles.isActive,
          roleIsSystemRole: roles.isSystemRole,
          roleMetadata: roles.metadata,
          roleCreatedBy: roles.createdBy,
          roleCreatedAt: roles.createdAt,
          roleUpdatedAt: roles.updatedAt,
          policyId: policies.id,
          policyName: policies.name,
          policyDescription: policies.description,
          policyVersion: policies.version,
          policyIsActive: policies.isActive,
          policyConditions: policies.conditions,
          policyActions: policies.actions,
          policyResources: policies.resources,
          policyEffect: policies.effect,
          policyPriority: policies.priority,
          policyCreatedBy: policies.createdBy,
          policyCreatedAt: policies.createdAt,
          policyUpdatedAt: policies.updatedAt,
        })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .leftJoin(rolePolicies, eq(roles.id, rolePolicies.roleId))
        .leftJoin(policies, eq(rolePolicies.policyId, policies.id))
        .where(and(eq(userRoles.userId, userId), eq(roles.isActive, true)));

      // Group by role and collect policies
      const roleMap = new Map<string, { role: DbRole; policies: Policy[] }>();

      for (const row of userRoleData) {
        if (!roleMap.has(row.roleId)) {
          roleMap.set(row.roleId, {
            role: {
              id: row.roleId,
              name: row.roleName,
              description: row.roleDescription,
              isActive: row.roleIsActive,
              isSystemRole: row.roleIsSystemRole,
              metadata: row.roleMetadata,
              createdBy: row.roleCreatedBy,
              createdAt: row.roleCreatedAt,
              updatedAt: row.roleUpdatedAt,
            },
            policies: [],
          });
        }

        if (row.policyId && row.policyIsActive) {
          const policy = this.convertToPolicy({
            id: row.policyId,
            name: row.policyName,
            description: row.policyDescription,
            version: row.policyVersion,
            isActive: row.policyIsActive,
            conditions: row.policyConditions,
            actions: row.policyActions,
            resources: row.policyResources,
            effect: row.policyEffect,
            priority: row.policyPriority,
            createdBy: row.policyCreatedBy,
            createdAt: row.policyCreatedAt,
            updatedAt: row.policyUpdatedAt,
          });

          const roleData = roleMap.get(row.roleId);
          if (roleData) {
            roleData.policies.push(policy);
          }
        }
      }

      return Array.from(roleMap.values()).map(({ role, policies }) =>
        this.convertToRole(role, policies)
      );
    } catch (error) {
      logger.error('Get user roles failed:', error);
      throw new HTTPException(500, {
        message: 'Failed to retrieve user roles',
      });
    }
  }
}

export const permissionEvaluatorService = new PermissionEvaluatorService();
