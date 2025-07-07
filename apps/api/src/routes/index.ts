import { Hono } from 'hono';

import { authRoutes } from '@/routes/auth';
import { permissionRoutes } from '@/routes/permissions';
import { policyRoutes } from '@/routes/policies';
import { profileRoutes } from '@/routes/profile';
import { roleRoutes } from '@/routes/roles';
import { userRoutes } from '@/routes/users';
import type { AppEnv } from '@/types';

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
v1Routes.route('/roles', roleRoutes);
v1Routes.route('/policies', policyRoutes);
v1Routes.route('/permissions', permissionRoutes);

// Mount versioned routes
apiRoutes.route('/v1', v1Routes);

// Default to v1 for backward compatibility
apiRoutes.route('/', v1Routes);
