import type { Context } from 'hono';

import type { AppEnv } from '@/types';

/**
 * Extract request context information from headers
 */
export function extractRequestContext(
  c: Context<AppEnv>,
  additionalContext?: { location?: string }
): {
  ipAddress?: string;
  userAgent?: string;
  location?: string;
} {
  const ipAddress = c.req.header('x-forwarded-for') || c.req.header('x-real-ip');
  const userAgent = c.req.header('user-agent');

  return {
    ...(ipAddress && { ipAddress }),
    ...(userAgent && { userAgent }),
    ...(additionalContext?.location && { location: additionalContext.location }),
  };
}
