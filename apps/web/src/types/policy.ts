/**
 * Policy Types
 * Based on the API policy schemas and PBAC system
 */

/**
 * Policy conditions for PBAC evaluation
 */
export interface PolicyConditions {
  user?: {
    attributes?: Record<string, unknown>;
  };
  resource?: {
    attributes?: Record<string, unknown>;
  };
  environment?: {
    timeRange?: {
      start?: string;
      end?: string;
    };
    ipWhitelist?: string[];
    ipBlacklist?: string[];
    location?: string[];
  };
  custom?: Record<string, unknown>;
}

/**
 * Policy entity
 */
export interface Policy {
  id: string;
  name: string;
  description?: string;
  version: number;
  isActive: boolean;
  conditions: PolicyConditions;
  actions: string[];
  resources: string[];
  effect: 'allow' | 'deny';
  priority: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

/**
 * Policy query parameters
 */
export interface PolicyQueryParams {
  page?: number;
  limit?: number;
  includeInactive?: boolean;
  effect?: 'allow' | 'deny';
  search?: string;
  sortBy?: 'name' | 'priority' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}

/**
 * Create policy request
 */
export interface CreatePolicyRequest {
  name: string;
  description?: string;
  conditions?: PolicyConditions;
  actions: string[];
  resources: string[];
  effect?: 'allow' | 'deny';
  priority?: number;
}

/**
 * Update policy request
 */
export interface UpdatePolicyRequest {
  name?: string;
  description?: string;
  conditions?: PolicyConditions;
  actions?: string[];
  resources?: string[];
  effect?: 'allow' | 'deny';
  priority?: number;
  isActive?: boolean;
}

/**
 * Toggle policy status request
 */
export interface TogglePolicyStatusRequest {
  isActive: boolean;
}

/**
 * Policy list response
 */
export interface PolicyListResponse {
  policies: Policy[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Policy evaluation request
 */
export interface PolicyEvaluationRequest {
  action: string;
  resource: string;
  resourceId?: string;
  context?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Policy evaluation result
 */
export interface PolicyEvaluationResult {
  allowed: boolean;
  matchedPolicies: Policy[];
  reason?: string;
}
