import { Hono } from 'hono';

import { config } from '@/config/app';
import type { AppEnv } from '@/types';

/**
 * API documentation routes
 */
export const docsRoutes = new Hono<AppEnv>();

// Only enable docs in development or if explicitly enabled
if (config.docs.enabled) {
  /**
   * Main documentation page
   */
  docsRoutes.get('/', c => {
    return c.json({
      message: 'CSmart API Documentation',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        openapi: '/docs/openapi.json',
        auth: {
          login: 'POST /api/v1/auth/login',
          register: 'POST /api/v1/auth/register',
        },
        users: {
          list: 'GET /api/v1/users',
          create: 'POST /api/v1/users',
        },
        profile: {
          get: 'GET /api/v1/profile',
          update: 'PUT /api/v1/profile',
        },
      },
    });
  });

  /**
   * OpenAPI specification
   */
  docsRoutes.get('/openapi.json', c => {
    return c.json({
      openapi: '3.0.0',
      info: {
        title: 'CSmart API',
        version: '1.0.0',
        description: 'Enterprise HonoJS API for CSmart application',
      },
      servers: [
        {
          url: `http://${config.host}:${config.port}`,
          description: 'Development server',
        },
      ],
      paths: {
        '/health': {
          get: {
            tags: ['Health'],
            summary: 'Health check',
            responses: {
              '200': { description: 'Service is healthy' },
            },
          },
        },
        '/api/v1/auth/login': {
          post: {
            tags: ['Authentication'],
            summary: 'User login',
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                      email: { type: 'string', format: 'email' },
                      password: { type: 'string', minLength: 6 },
                    },
                  },
                },
              },
            },
            responses: {
              '200': { description: 'Login successful' },
              '401': { description: 'Invalid credentials' },
            },
          },
        },
      },
    });
  });
} else {
  // Disabled message
  docsRoutes.get('/', c => {
    return c.json({ message: 'API documentation is disabled' }, 404);
  });
}
