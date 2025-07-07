import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';
import { timing } from 'hono/timing';

import { config } from '@/config/app';
import { authMiddleware } from '@/middleware/auth';
import { errorHandler } from '@/middleware/error-handler';
import { rateLimitMiddleware } from '@/middleware/rate-limiter';
import { requestLogger } from '@/middleware/request-logger';
import { apiRoutes } from '@/routes';
import { docsRoutes } from '@/routes/docs';
import { healthRoutes } from '@/routes/health';
import type { AppEnv } from '@/types';

/**
 * Create and configure the Hono application
 */
export function createApp(): Hono<AppEnv> {
  const app = new Hono<AppEnv>();

  // Security middleware
  app.use('*', secureHeaders());

  // CORS configuration
  app.use(
    '*',
    cors({
      origin: config.cors.origins,
      allowMethods: config.cors.methods,
      allowHeaders: config.cors.headers,
      credentials: config.cors.credentials,
    })
  );

  // Request timing
  app.use('*', timing());

  // Logging middleware
  if (config.env === 'development') {
    app.use('*', logger());
  }
  app.use('*', requestLogger);

  // Pretty JSON in development
  if (config.env === 'development') {
    app.use('*', prettyJSON());
  }

  // Rate limiting
  app.use('*', rateLimitMiddleware);

  // Health check routes (no auth required)
  app.route('/health', healthRoutes);

  // API documentation routes
  app.route('/docs', docsRoutes);

  // API routes with authentication
  app.use('/api/*', authMiddleware);
  app.route('/api', apiRoutes);

  // Root endpoint
  app.get('/', c => {
    return c.json({
      name: 'CSmart API',
      version: '1.0.0',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: config.env,
    });
  });

  // 404 handler
  app.notFound(c => {
    return c.json(
      {
        error: 'Not Found',
        message: 'The requested resource was not found',
        path: c.req.path,
        method: c.req.method,
      },
      404
    );
  });

  // Global error handler
  app.onError(errorHandler);

  return app;
}
