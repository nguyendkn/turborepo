import { swaggerUI } from '@hono/swagger-ui';
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
   * Swagger UI
   */
  docsRoutes.get(
    '/',
    swaggerUI({
      url: '/docs/openapi.json',
    })
  );

  /**
   * OpenAPI specification
   */
  docsRoutes.get('/openapi.json', c => {
    const openApiSpec = {
      openapi: '3.0.0',
      info: {
        title: 'CSmart API',
        version: '1.0.0',
        description: 'Enterprise HonoJS API for CSmart application',
        contact: {
          name: 'CSmart Team',
          email: 'support@csmart.com',
        },
        license: {
          name: 'MIT',
          url: 'https://opensource.org/licenses/MIT',
        },
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
            summary: 'Basic health check',
            responses: {
              '200': {
                description: 'Service is healthy',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean' },
                        data: {
                          type: 'object',
                          properties: {
                            status: { type: 'string' },
                            timestamp: { type: 'string' },
                            uptime: { type: 'number' },
                            version: { type: 'string' },
                          },
                        },
                        timestamp: { type: 'string' },
                        requestId: { type: 'string' },
                      },
                    },
                  },
                },
              },
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
              '200': {
                description: 'Login successful',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        success: { type: 'boolean' },
                        data: {
                          type: 'object',
                          properties: {
                            token: { type: 'string' },
                            refreshToken: { type: 'string' },
                            user: {
                              type: 'object',
                              properties: {
                                id: { type: 'string' },
                                email: { type: 'string' },
                                role: { type: 'string' },
                              },
                            },
                          },
                        },
                        timestamp: { type: 'string' },
                        requestId: { type: 'string' },
                      },
                    },
                  },
                },
              },
              '401': {
                description: 'Invalid credentials',
              },
            },
          },
        },
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
        schemas: {
          Error: {
            type: 'object',
            properties: {
              success: { type: 'boolean', example: false },
              error: {
                type: 'object',
                properties: {
                  code: { type: 'string' },
                  message: { type: 'string' },
                  details: { type: 'object' },
                },
              },
              timestamp: { type: 'string' },
              requestId: { type: 'string' },
            },
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
    };

    return c.json(openApiSpec);
  });
} else {
  // Disabled message
  docsRoutes.get('/', c => {
    return c.json(
      {
        message: 'API documentation is disabled',
      },
      404
    );
  });
}
