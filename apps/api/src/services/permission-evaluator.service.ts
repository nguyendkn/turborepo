import { HTTPException } from 'hono/http-exception';

import { policyEngineService } from './policy-engine.service';

import {
  PolicyEvaluationCache,
  RolePolicy,
  UserRole,
  type IRole,
  type IPolicy,
} from '@/database/models';
import type {
  PolicyEvaluationContext,
  PolicyEvaluationResult,
  PermissionRequest,
  User,
  Role,
  Policy,
  PolicyConditions,
} from '@/types';
import type { RoleMetadata } from '@/types/database';
import { logger } from '@/utils/logger';

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
      await PolicyEvaluationCache.deleteMany({ userId });

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

      const cachedResult = await PolicyEvaluationCache.findOne({
        userId,
        cacheKey,
        createdAt: { $gte: expirationTime },
      });

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
      await PolicyEvaluationCache.deleteOne({ userId, cacheKey });

      // Insert new cache entry
      const cacheEntry = new PolicyEvaluationCache({
        userId,
        cacheKey,
        result,
      });

      await cacheEntry.save();
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
  private convertToRole(dbRole: IRole, policies: Policy[] = []): Role {
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
   * Get user roles with their associated policies
   */
  async getUserRoles(userId: string): Promise<Role[]> {
    try {
      // Get user roles
      const userRoleData = await UserRole.find({ userId })
        .populate('roleId');

      const roles: Role[] = [];

      for (const userRole of userRoleData) {
        if (!userRole.roleId) continue;

        const roleDoc = userRole.roleId as unknown as IRole;

        // Skip inactive roles
        if (!roleDoc.isActive) continue;

        // Get policies for this role
        const rolePoliciesData = await RolePolicy.find({ roleId: roleDoc._id })
          .populate('policyId');

        const policies: Policy[] = [];
        for (const rolePolicy of rolePoliciesData) {
          if (rolePolicy.policyId) {
            const policyDoc = rolePolicy.policyId as unknown as IPolicy;
            if (policyDoc.isActive) {
              policies.push(this.convertToPolicy(policyDoc));
            }
          }
        }

        roles.push(this.convertToRole(roleDoc, policies));
      }

      return roles;
    } catch (error) {
      logger.error('Get user roles failed:', error);
      throw new HTTPException(500, {
        message: 'Failed to retrieve user roles',
      });
    }
  }
}

export const permissionEvaluatorService = new PermissionEvaluatorService();
