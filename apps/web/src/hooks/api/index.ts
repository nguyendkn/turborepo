/**
 * API Hooks Index
 * Centralized exports for all API interaction hooks
 */

// Authentication hooks
export * from './use-auth-api';

// User management hooks
export * from './use-users-api';

// Role management hooks
export * from './use-roles-api';

// Policy management hooks
export * from './use-policies-api';

/**
 * Re-export commonly used types for convenience
 */
export type {
  // Auth types
  LoginRequest,
  RegisterRequest,
  AuthResponse,

  // User types
  User,
  UserQueryParams,
  CreateUserRequest,
  UpdateUserRequest,

  // Role types
  Role,
  RoleQueryParams,
  CreateRoleRequest,
  UpdateRoleRequest,

  // Policy types
  Policy,
  PolicyQueryParams,
  CreatePolicyRequest,
  UpdatePolicyRequest,
} from '@/types';
