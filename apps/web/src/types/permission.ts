/**
 * Permission Types
 * Based on the API permission schemas and PBAC system
 */

/**
 * Permission request for PBAC evaluation
 */
export interface PermissionRequest {
  action: string;
  resource: string;
  resourceId?: string;
}

/**
 * Permission context for evaluation
 */
export interface PermissionContext {
  ipAddress?: string;
  userAgent?: string;
  location?: string;
  timestamp?: string;
}

/**
 * Permission evaluation result
 */
export interface PermissionEvaluationResult {
  hasPermission: boolean;
  reason?: string;
  matchedPolicies?: string[];
}

/**
 * Available actions in the system
 */
export type SystemAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'list'
  | 'assign'
  | 'unassign'
  | 'activate'
  | 'deactivate';

/**
 * Available resources in the system
 */
export type SystemResource =
  | 'users'
  | 'roles'
  | 'policies'
  | 'permissions'
  | 'profile'
  | 'auth';

/**
 * Permission definition
 */
export interface Permission {
  id: string;
  action: SystemAction;
  resource: SystemResource;
  description?: string;
  isSystemPermission: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Permission query parameters
 */
export interface PermissionQueryParams {
  page?: number;
  limit?: number;
  action?: SystemAction;
  resource?: SystemResource;
  search?: string;
  sortBy?: 'action' | 'resource' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Permission list response
 */
export interface PermissionListResponse {
  permissions: Permission[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * User permissions summary
 */
export interface UserPermissions {
  userId: string;
  permissions: {
    [resource: string]: SystemAction[];
  };
  roles: string[];
  lastEvaluated: string;
}
