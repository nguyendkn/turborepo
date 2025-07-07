import type { MiddlewareHandler } from 'hono';
import { v4 as uuidv4 } from 'uuid';

import type { AppEnv } from '@/types';
import { logRequest } from '@/utils/logger';

/**
 * Request logging middleware
 */
export const requestLogger: MiddlewareHandler<AppEnv> = async (c, next) => {
  // Generate request ID
  const requestId = uuidv4();
  c.set('requestId', requestId);

  // Set start time
  const startTime = Date.now();
  c.set('startTime', startTime);

  // Add request ID to response headers
  c.header('X-Request-ID', requestId);

  await next();

  // Calculate response time
  const responseTime = Date.now() - startTime;

  // Log the request
  logRequest(
    c.req.method,
    c.req.path,
    c.res.status,
    responseTime,
    c.req.header('user-agent'),
    c.req.header('x-forwarded-for') || c.req.header('x-real-ip')
  );
};
