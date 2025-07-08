/**
 * Role Types
 * Based on the API role schemas and PBAC system
 */

import type { Policy } from './policy';

/**
 * Role entity
 */
export interface Role {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  isSystemRole: boolean;
  metadata?: Record<string, unknown>;
  policies?: Policy[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

/**
 * Role query parameters
 */
export interface RoleQueryParams {
  page?: number;
  limit?: number;
  includeInactive?: boolean;
  systemRolesOnly?: boolean;
  search?: string;
  sortBy?: 'name' | 'priority' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
  [key: string]: unknown;
}

/**
 * Create role request
 */
export interface CreateRoleRequest {
  name: string;
  description?: string;
  policyIds: string[];
  isSystemRole?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Update role request
 */
export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  policyIds?: string[];
  isActive?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Role assignment request
 */
export interface AssignRoleRequest {
  userId: string;
  expiresAt?: string;
}

/**
 * Role assignment entity
 */
export interface RoleAssignment {
  id: string;
  userId: string;
  roleId: string;
  assignedBy: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Role list response
 */
export interface RoleListResponse {
  roles: Role[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Role with user count
 */
export interface RoleWithStats extends Role {
  userCount: number;
  policyCount: number;
}
