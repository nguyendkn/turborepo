import type {
    Policy,
    PolicyConditions,
    PolicyEvaluationContext,
    PolicyEvaluationResult,
} from '@/types';
import { logger } from '@/utils/logger';

/**
 * Policy Engine Service
 * Evaluates policies against user requests to determine access permissions
 */
export class PolicyEngineService {
  /**
   * Evaluate a single policy against the context
   */
  async evaluatePolicy(
    policy: Policy,
    context: PolicyEvaluationContext
  ): Promise<PolicyEvaluationResult> {
    logger.debug('Evaluating policy', {
      policyId: policy.id,
      policyName: policy.name,
      userId: context.user.id,
    });

    // Check if policy is active
    if (!policy.isActive) {
      return {
        allowed: false,
        decision: 'not_applicable',
        policies: [],
        reason: 'Policy is inactive',
        matchedConditions: [],
      };
    }

    // Check if action matches
    const actionMatches = this.matchesAction(
      policy.actions,
      context.request.action
    );

    logger.debug('Action matching result', {
      policyActions: policy.actions,
      requestAction: context.request.action,
      actionMatches
    });

    if (!actionMatches) {
      return {
        allowed: false,
        decision: 'not_applicable',
        policies: [],
        reason: 'Action does not match policy',
        matchedConditions: [],
      };
    }

    // Check if resource matches
    const resourceMatches = this.matchesResource(
      policy.resources,
      context.request.resource
    );

    logger.debug('Resource matching result', {
      policyResources: policy.resources,
      requestResource: context.request.resource,
      resourceMatches
    });

    if (!resourceMatches) {
      return {
        allowed: false,
        decision: 'not_applicable',
        policies: [],
        reason: 'Resource does not match policy',
        matchedConditions: [],
      };
    }

    // Evaluate conditions
    const conditionResult = await this.evaluateConditions(
      policy.conditions,
      context
    );
    if (!conditionResult.matches) {
      return {
        allowed: false,
        decision: 'not_applicable',
        policies: [],
        reason: `Conditions not met: ${conditionResult.reason}`,
        matchedConditions: conditionResult.matchedConditions,
      };
    }

    // Policy matches - return the effect
    return {
      allowed: policy.effect === 'allow',
      decision: policy.effect,
      policies: [{ policy, effect: policy.effect, matched: true }],
      reason: `Policy ${policy.name} matched`,
      matchedConditions: conditionResult.matchedConditions,
    };
  }

  /**
   * Check if action matches policy actions
   */
  private matchesAction(
    policyActions: string[],
    requestAction: string
  ): boolean {
    const result = policyActions.some(action => {
      // Support wildcards
      if (action === '*') return true;
      if (action.endsWith('*')) {
        const prefix = action.slice(0, -1);
        return requestAction.startsWith(prefix);
      }
      return action === requestAction;
    });

    console.log('DEBUG matchesAction:', {
      policyActions,
      requestAction,
      result
    });

    return result;
  }

  /**
   * Check if resource matches policy resources
   */
  private matchesResource(
    policyResources: string[],
    requestResource: string
  ): boolean {
    const result = policyResources.some(resource => {
      // Support wildcards
      if (resource === '*') return true;
      if (resource.endsWith('*')) {
        const prefix = resource.slice(0, -1);
        return requestResource.startsWith(prefix);
      }
      return resource === requestResource;
    });

    console.log('DEBUG matchesResource:', {
      policyResources,
      requestResource,
      result
    });

    return result;
  }

  /**
   * Evaluate policy conditions
   */
  private async evaluateConditions(
    conditions: PolicyConditions,
    context: PolicyEvaluationContext
  ): Promise<{
    matches: boolean;
    reason: string;
    matchedConditions: string[];
  }> {
    const matchedConditions: string[] = [];

    try {
      // User conditions
      if (conditions.user) {
        const userConditionResult = this.evaluateUserConditions(
          conditions.user,
          context
        );
        if (!userConditionResult.matches) {
          return {
            matches: false,
            reason: userConditionResult.reason,
            matchedConditions,
          };
        }
        matchedConditions.push(...userConditionResult.matchedConditions);
      }

      // Resource conditions
      if (conditions.resource) {
        const resourceConditionResult = this.evaluateResourceConditions(
          conditions.resource,
          context
        );
        if (!resourceConditionResult.matches) {
          return {
            matches: false,
            reason: resourceConditionResult.reason,
            matchedConditions,
          };
        }
        matchedConditions.push(...resourceConditionResult.matchedConditions);
      }

      // Environment conditions
      if (conditions.environment) {
        const envConditionResult = await this.evaluateEnvironmentConditions(
          conditions.environment,
          context
        );
        if (!envConditionResult.matches) {
          return {
            matches: false,
            reason: envConditionResult.reason,
            matchedConditions,
          };
        }
        matchedConditions.push(...envConditionResult.matchedConditions);
      }

      return {
        matches: true,
        reason: 'All conditions matched',
        matchedConditions,
      };
    } catch (error) {
      logger.error('Error evaluating conditions:', error);
      return {
        matches: false,
        reason: 'Error evaluating conditions',
        matchedConditions,
      };
    }
  }

  /**
   * Evaluate user-specific conditions
   */
  private evaluateUserConditions(
    userConditions: NonNullable<PolicyConditions['user']>,
    context: PolicyEvaluationContext
  ): { matches: boolean; reason: string; matchedConditions: string[] } {
    const matchedConditions: string[] = [];

    if (userConditions.attributes) {
      for (const [key, expectedValue] of Object.entries(
        userConditions.attributes
      )) {
        const actualValue = context.user.attributes?.[key];
        if (actualValue !== expectedValue) {
          return {
            matches: false,
            reason: `User attribute ${key} does not match expected value`,
            matchedConditions,
          };
        }
        matchedConditions.push(`user.${key}`);
      }
    }

    return {
      matches: true,
      reason: 'User conditions matched',
      matchedConditions,
    };
  }

  /**
   * Evaluate resource-specific conditions
   */
  private evaluateResourceConditions(
    resourceConditions: NonNullable<PolicyConditions['resource']>,
    context: PolicyEvaluationContext
  ): { matches: boolean; reason: string; matchedConditions: string[] } {
    const matchedConditions: string[] = [];

    if (resourceConditions.attributes) {
      for (const [key, expectedValue] of Object.entries(
        resourceConditions.attributes
      )) {
        const actualValue = context.resource.attributes?.[key];
        if (actualValue !== expectedValue) {
          return {
            matches: false,
            reason: `Resource attribute ${key} does not match expected value`,
            matchedConditions,
          };
        }
        matchedConditions.push(`resource.${key}`);
      }
    }

    return {
      matches: true,
      reason: 'Resource conditions matched',
      matchedConditions,
    };
  }

  /**
   * Evaluate environment-specific conditions
   */
  private async evaluateEnvironmentConditions(
    envConditions: NonNullable<PolicyConditions['environment']>,
    context: PolicyEvaluationContext
  ): Promise<{
    matches: boolean;
    reason: string;
    matchedConditions: string[];
  }> {
    const matchedConditions: string[] = [];

    // Time range conditions
    if (envConditions.timeRange) {
      const now = context.environment.timestamp;
      const { start, end } = envConditions.timeRange;

      if (start && now < new Date(start)) {
        return {
          matches: false,
          reason: 'Current time is before allowed time range',
          matchedConditions,
        };
      }

      if (end && now > new Date(end)) {
        return {
          matches: false,
          reason: 'Current time is after allowed time range',
          matchedConditions,
        };
      }

      matchedConditions.push('environment.timeRange');
    }

    // IP whitelist/blacklist
    if (context.environment.ipAddress) {
      if (envConditions.ipWhitelist && envConditions.ipWhitelist.length > 0) {
        if (
          !envConditions.ipWhitelist.includes(context.environment.ipAddress)
        ) {
          return {
            matches: false,
            reason: 'IP address not in whitelist',
            matchedConditions,
          };
        }
        matchedConditions.push('environment.ipWhitelist');
      }

      if (envConditions.ipBlacklist && envConditions.ipBlacklist.length > 0) {
        if (envConditions.ipBlacklist.includes(context.environment.ipAddress)) {
          return {
            matches: false,
            reason: 'IP address is blacklisted',
            matchedConditions,
          };
        }
        matchedConditions.push('environment.ipBlacklist');
      }
    }

    // Location conditions
    if (envConditions.location && context.environment.location) {
      if (!envConditions.location.includes(context.environment.location)) {
        return {
          matches: false,
          reason: 'Location not allowed',
          matchedConditions,
        };
      }
      matchedConditions.push('environment.location');
    }

    return {
      matches: true,
      reason: 'Environment conditions matched',
      matchedConditions,
    };
  }
}

export const policyEngineService = new PolicyEngineService();
