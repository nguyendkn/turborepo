import type { Context } from 'hono';

/**
 * Application environment type
 */
export interface AppEnv {
  Bindings: Record<string, unknown>;
  Variables: {
    user?: User;
    requestId: string;
    startTime: number;
  };
}

/**
 * User type for authentication
 */
export interface User {
  id: string;
  email: string;
  role: UserRole;
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User roles
 */
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  timestamp: string;
  requestId: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

/**
 * Sort parameters
 */
export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

/**
 * Filter parameters
 */
export interface FilterParams {
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  [key: string]: string | number | boolean | undefined;
}

/**
 * JWT Payload
 */
export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

/**
 * Refresh token payload
 */
export interface RefreshTokenPayload {
  sub: string; // user id
  tokenId: string;
  iat: number;
  exp: number;
}

/**
 * Application context type
 */
export type AppContext = Context<AppEnv>;

/**
 * Error codes
 */
export enum ErrorCode {
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',

  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',

  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',

  // Server errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',

  // Rate limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}
