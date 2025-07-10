/**
 * Public routes configuration
 * Routes that don't require authentication
 */

export interface PublicRoutePattern {
  /** The route pattern */
  pattern: string;
  /** HTTP methods allowed for this route (if not specified, all methods are allowed) */
  methods?: string[] | undefined;
}

/**
 * List of public routes that don't require authentication
 */
export const PUBLIC_ROUTES: PublicRoutePattern[] = [
  // Health check endpoints
  {
    pattern: '/health',
    methods: ['GET'],
  },
  {
    pattern: '/health/*',
    methods: ['GET'],
  },

  // Authentication endpoints
  {
    pattern: '/auth/login',
    methods: ['POST'],
  },
  {
    pattern: '/auth/register',
    methods: ['POST'],
  },
  {
    pattern: '/auth/refresh',
    methods: ['POST'],
  },
  {
    pattern: '/auth/forgot-password',
    methods: ['POST'],
  },
  {
    pattern: '/auth/reset-password',
    methods: ['POST'],
  },
  {
    pattern: '/auth/verify-email',
    methods: ['POST', 'GET'],
  },

  // API Documentation endpoints
  {
    pattern: '/docs',
    methods: ['GET'],
  },
  {
    pattern: '/docs/*',
  },
  {
    pattern: '/api-docs',
    methods: ['GET'],
  },
  {
    pattern: '/api-docs/*',
  },

  // Static assets (if any)
  {
    pattern: '/static/*',
  },
  {
    pattern: '/assets/*',
  },

  // Webhook endpoints (usually don't require user auth)
  {
    pattern: '/webhooks/*',
    methods: ['POST'],
  },

  // Public API endpoints (if any)
  {
    pattern: '/public/*',
  },

  // Metrics endpoints (for monitoring)
  {
    pattern: '/metrics',
    methods: ['GET'],
  },
];
