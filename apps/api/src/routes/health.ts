import { Hono } from 'hono';

import { testConnection } from '@/config/database';
import { testRedisConnection } from '@/config/redis';
import type { ApiResponse, AppEnv } from '@/types';
import { logger } from '@/utils/logger';

/**
 * Health check routes
 */
export const healthRoutes = new Hono<AppEnv>();

/**
 * Basic health check
 */
healthRoutes.get('/', c => {
  const response: ApiResponse = {
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
    },
    timestamp: new Date().toISOString(),
    requestId: c.get('requestId'),
  };

  return c.json(response);
});

/**
 * Detailed health check with dependencies
 */
healthRoutes.get('/detailed', async c => {
  const checks = {
    database: false,
    redis: false,
  };

  // Test database connection
  try {
    checks.database = await testConnection();
  } catch (error) {
    logger.error('Database health check failed:', error);
  }

  // Test Redis connection
  try {
    checks.redis = await testRedisConnection();
  } catch (error) {
    logger.error('Redis health check failed:', error);
  }

  const allHealthy = Object.values(checks).every(Boolean);
  const status = allHealthy ? 'healthy' : 'unhealthy';

  const response: ApiResponse = {
    success: allHealthy,
    data: {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      checks,
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
      },
    },
    timestamp: new Date().toISOString(),
    requestId: c.get('requestId'),
  };

  return c.json(response, allHealthy ? 200 : 503);
});

/**
 * Readiness probe
 */
healthRoutes.get('/ready', async c => {
  try {
    const dbHealthy = await testConnection();
    const redisHealthy = await testRedisConnection();

    if (dbHealthy && redisHealthy) {
      return c.json({ status: 'ready' });
    } else {
      return c.json({ status: 'not ready' }, 503);
    }
  } catch (error) {
    logger.error('Readiness check failed:', error);
    return c.json({ status: 'not ready' }, 503);
  }
});

/**
 * Liveness probe
 */
healthRoutes.get('/live', c => {
  return c.json({ status: 'alive' });
});

/**
 * Metrics endpoint
 */
healthRoutes.get('/metrics', async c => {
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();

  const response: ApiResponse = {
    success: true,
    data: {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external,
        arrayBuffers: memoryUsage.arrayBuffers,
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
      eventLoop: {
        // TODO: Add event loop lag measurement
        lag: 0,
      },
      gc: {
        // TODO: Add garbage collection metrics
        collections: 0,
      },
    },
    timestamp: new Date().toISOString(),
    requestId: c.get('requestId'),
  };

  return c.json(response);
});
