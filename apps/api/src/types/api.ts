import type { Context } from 'hono';

import type { User } from './user';

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
 * Application context type
 */
export type AppContext = Context<AppEnv>;

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
  role?: string;
  isActive?: boolean;
  [key: string]: string | number | boolean | undefined;
}
