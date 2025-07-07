import type { ErrorHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';

import { ErrorCode } from '@/types';
import type { AppEnv, ApiResponse } from '@/types';
import { logger } from '@/utils/logger';

/**
 * Global error handler middleware
 */
export const errorHandler: ErrorHandler<AppEnv> = (err, c) => {
  const requestId = c.get('requestId') || 'unknown';

  // Log the error
  logger.error('Request error', {
    requestId,
    error: err.message,
    stack: err.stack,
    path: c.req.path,
    method: c.req.method,
    userAgent: c.req.header('user-agent'),
    ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
  });

  // Handle HTTP exceptions
  if (err instanceof HTTPException) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: getErrorCode(err.status),
        message: err.message,
      },
      timestamp: new Date().toISOString(),
      requestId,
    };

    return c.json(response, err.status);
  }

  // Handle validation errors (Zod)
  if (err.name === 'ZodError') {
    const zodError = err as { issues?: unknown[]; errors?: unknown[] };
    const response: ApiResponse = {
      success: false,
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Validation failed',
        details: zodError.issues || zodError.errors,
      },
      timestamp: new Date().toISOString(),
      requestId,
    };

    return c.json(response, 400);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    const response: ApiResponse = {
      success: false,
      error: {
        code:
          err.name === 'TokenExpiredError'
            ? ErrorCode.TOKEN_EXPIRED
            : ErrorCode.INVALID_TOKEN,
        message: 'Authentication failed',
      },
      timestamp: new Date().toISOString(),
      requestId,
    };

    return c.json(response, 401);
  }

  // Handle database errors
  const dbError = err as { code?: string; constraint?: string };
  if (
    dbError.code &&
    typeof dbError.code === 'string' &&
    dbError.code.startsWith('23')
  ) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: ErrorCode.DATABASE_ERROR,
        message: 'Database operation failed',
      },
      timestamp: new Date().toISOString(),
      requestId,
    };

    return c.json(response, 400);
  }

  // Default internal server error
  const response: ApiResponse = {
    success: false,
    error: {
      code: ErrorCode.INTERNAL_ERROR,
      message: 'Internal server error',
    },
    timestamp: new Date().toISOString(),
    requestId,
  };

  return c.json(response, 500);
};

/**
 * Map HTTP status codes to error codes
 */
function getErrorCode(status: number): ErrorCode {
  switch (status) {
    case 400:
      return ErrorCode.INVALID_INPUT;
    case 401:
      return ErrorCode.UNAUTHORIZED;
    case 403:
      return ErrorCode.FORBIDDEN;
    case 404:
      return ErrorCode.NOT_FOUND;
    case 409:
      return ErrorCode.ALREADY_EXISTS;
    case 429:
      return ErrorCode.RATE_LIMIT_EXCEEDED;
    default:
      return ErrorCode.INTERNAL_ERROR;
  }
}
