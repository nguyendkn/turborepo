import type { Policy } from './policy';

/**
 * Policy evaluation context
 */
export interface PolicyEvaluationContext {
  user: {
    id: string;
    email: string;
    attributes?: Record<string, unknown>;
  };
  resource: {
    type: string;
    id?: string;
    attributes?: Record<string, unknown>;
  };
  request: {
    action: string;
    resource: string;
    resourceId?: string;
  };
  action: string;
  environment: {
    timestamp: Date;
    ipAddress?: string;
    userAgent?: string;
    location?: string;
  };
}

/**
 * Policy evaluation result
 */
export interface PolicyEvaluationResult {
  allowed: boolean;
  decision: 'allow' | 'deny' | 'not_applicable';
  policies: {
    policy: Policy;
    effect: 'allow' | 'deny';
    matched: boolean;
  }[];
  reason?: string;
  matchedConditions?: string[];
}

/**
 * Permission check request
 */
export interface PermissionRequest {
  action: string;
  resource: string;
  resourceId?: string;
  context?: Record<string, unknown>;
}
