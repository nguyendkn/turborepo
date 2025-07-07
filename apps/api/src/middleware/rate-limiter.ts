import type { MiddlewareHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { RateLimiterRedis } from 'rate-limiter-flexible';

import { config } from '@/config/app';
import { getRedisClient } from '@/config/redis';
import type { AppEnv } from '@/types/app';
import { logger } from '@/utils/logger';

/**
 * Rate limiter instance
 */
let rateLimiter: RateLimiterRedis | null = null;

/**
 * Initialize rate limiter
 */
function initRateLimiter(): RateLimiterRedis {
  if (!rateLimiter) {
    try {
      const redisClient = getRedisClient();

      rateLimiter = new RateLimiterRedis({
        storeClient: redisClient,
        keyPrefix: 'rl:',
        points: config.rateLimit.maxRequests,
        duration: Math.floor(config.rateLimit.windowMs / 1000), // Convert to seconds
        blockDuration: Math.floor(config.rateLimit.windowMs / 1000), // Block for the same duration
      });
    } catch (error) {
      logger.error('Failed to initialize rate limiter:', error);
      throw error;
    }
  }

  return rateLimiter;
}

/**
 * Rate limiting middleware
 */
export const rateLimitMiddleware: MiddlewareHandler<AppEnv> = async (
  c,
  next
) => {
  try {
    const limiter = initRateLimiter();

    // Get client IP
    const clientIP =
      c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';

    // Check rate limit
    const result = await limiter.consume(clientIP);

    // Add rate limit headers
    c.header('X-RateLimit-Limit', config.rateLimit.maxRequests.toString());
    c.header(
      'X-RateLimit-Remaining',
      result.remainingPoints?.toString() || '0'
    );
    c.header(
      'X-RateLimit-Reset',
      new Date(Date.now() + result.msBeforeNext).toISOString()
    );

    await next();
  } catch (rateLimiterRes) {
    // Rate limit exceeded
    if (
      rateLimiterRes &&
      typeof rateLimiterRes === 'object' &&
      'msBeforeNext' in rateLimiterRes
    ) {
      const resetTime = new Date(
        Date.now() + (rateLimiterRes.msBeforeNext as number)
      );

      c.header('X-RateLimit-Limit', config.rateLimit.maxRequests.toString());
      c.header('X-RateLimit-Remaining', '0');
      c.header('X-RateLimit-Reset', resetTime.toISOString());
      c.header(
        'Retry-After',
        Math.round((rateLimiterRes.msBeforeNext as number) / 1000).toString()
      );

      logger.warn('Rate limit exceeded', {
        ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
        path: c.req.path,
        method: c.req.method,
        userAgent: c.req.header('user-agent'),
      });

      throw new HTTPException(429, {
        message: 'Too many requests, please try again later',
      });
    }

    // Other errors
    logger.error('Rate limiter error:', rateLimiterRes);
    await next(); // Continue without rate limiting on error
  }
};
