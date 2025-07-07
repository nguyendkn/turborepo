import { Hono } from 'hono';

import { authRoutes } from '@/routes/auth';
import { profileRoutes } from '@/routes/profile';
import { userRoutes } from '@/routes/users';
import type { AppEnv } from '@/types/app';

/**
 * Main API routes
 */
export const apiRoutes = new Hono<AppEnv>();

// API version 1 routes
const v1Routes = new Hono<AppEnv>();

// Mount route modules
v1Routes.route('/auth', authRoutes);
v1Routes.route('/users', userRoutes);
v1Routes.route('/profile', profileRoutes);

// Mount versioned routes
apiRoutes.route('/v1', v1Routes);

// Default to v1 for backward compatibility
apiRoutes.route('/', v1Routes);
