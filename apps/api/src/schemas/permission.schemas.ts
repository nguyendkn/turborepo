import { z } from 'zod';

/**
 * Permission evaluation validation schemas
 */

/**
 * Permission check validation schema
 */
export const permissionCheckSchema = z.object({
  action: z.string().min(1, 'Action is required'),
  resource: z.string().min(1, 'Resource is required'),
  resourceId: z.string().optional(),
  context: z.record(z.unknown()).optional(),
  location: z.string().optional(),
});

/**
 * Multiple permissions check validation schema
 */
export const multiplePermissionsSchema = z.object({
  permissions: z
    .array(
      z.object({
        action: z.string().min(1, 'Action is required'),
        resource: z.string().min(1, 'Resource is required'),
        resourceId: z.string().optional(),
        context: z.record(z.unknown()).optional(),
      })
    )
    .min(1, 'At least one permission is required'),
  location: z.string().optional(),
});
