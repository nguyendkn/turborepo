/**
 * API Response Types
 * Based on the HonoJS API application structure
 */

/**
 * Standard API Response wrapper
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
 * Pagination parameters for API requests
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * Common query parameters
 */
export interface BaseQueryParams extends PaginationParams {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * API Error response
 */
export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
  status?: number;
}

/**
 * Network error for failed requests
 */
export interface NetworkError extends Error {
  code: 'NETWORK_ERROR';
  message: string;
  status?: number;
  isNetworkError: true;
}

/**
 * Validation error for form/input validation
 */
export interface ValidationError extends Error {
  code: 'VALIDATION_ERROR';
  message: string;
  field?: string;
  details?: Record<string, string[]>;
  isValidationError: true;
}

/**
 * Authentication error for auth failures
 */
export interface AuthenticationError extends Error {
  code: 'AUTHENTICATION_ERROR' | 'UNAUTHORIZED' | 'TOKEN_EXPIRED';
  message: string;
  status: 401;
  isAuthenticationError: true;
}

/**
 * Authorization error for permission failures
 */
export interface AuthorizationError extends Error {
  code: 'AUTHORIZATION_ERROR' | 'FORBIDDEN';
  message: string;
  status: 403;
  isAuthorizationError: true;
}

/**
 * Server error for 5xx responses
 */
export interface ServerError extends Error {
  code: 'SERVER_ERROR' | 'INTERNAL_ERROR';
  message: string;
  status: number;
  isServerError: true;
}

/**
 * Union type for all possible API errors
 */
export type ApiErrorType =
  | ApiError
  | NetworkError
  | ValidationError
  | AuthenticationError
  | AuthorizationError
  | ServerError;

/**
 * Type guard for API errors
 */
export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
};

/**
 * Type guard for network errors
 */
export const isNetworkError = (error: unknown): error is NetworkError => {
  return (
    typeof error === 'object' && error !== null && 'isNetworkError' in error
  );
};

/**
 * Type guard for validation errors
 */
export const isValidationError = (error: unknown): error is ValidationError => {
  return (
    typeof error === 'object' && error !== null && 'isValidationError' in error
  );
};

/**
 * Type guard for authentication errors
 */
export const isAuthenticationError = (
  error: unknown
): error is AuthenticationError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAuthenticationError' in error
  );
};

/**
 * Type guard for authorization errors
 */
export const isAuthorizationError = (
  error: unknown
): error is AuthorizationError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAuthorizationError' in error
  );
};

/**
 * Type guard for server errors
 */
export const isServerError = (error: unknown): error is ServerError => {
  return (
    typeof error === 'object' && error !== null && 'isServerError' in error
  );
};

/**
 * HTTP Methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * API Endpoint configuration
 */
export interface ApiEndpoint {
  method: HttpMethod;
  url: string;
  requiresAuth?: boolean;
}
