/**
 * Database-specific types for MongoDB operations
 */

/**
 * MongoDB filter conditions for queries
 */
export interface MongoFilterConditions {
  // Common fields
  _id?: string | { $in: string[] };
  isActive?: boolean;
  createdAt?: Date | { $gte?: Date; $lte?: Date };
  updatedAt?: Date | { $gte?: Date; $lte?: Date };

  // Search operations
  $or?: Array<{
    [key: string]: { $regex: string; $options: string } | string | boolean;
  }>;

  // User-specific filters
  email?: string | { $regex: string; $options: string };
  firstName?: string | { $regex: string; $options: string };
  lastName?: string | { $regex: string; $options: string };
  emailVerified?: boolean;

  // Role-specific filters
  name?: string | { $regex: string; $options: string };
  isSystemRole?: boolean;

  // Policy-specific filters
  effect?: 'allow' | 'deny';
  priority?: number | { $gte?: number; $lte?: number };
  version?: number;

  // Relationship filters
  userId?: string;
  roleId?: string;
  policyId?: string;

  // Generic field for extensibility
  [key: string]: unknown;
}

/**
 * User-specific filter conditions
 */
export interface UserFilterConditions {
  _id?: string | { $in: string[] };
  email?: string | { $regex: string; $options: string };
  firstName?: string | { $regex: string; $options: string };
  lastName?: string | { $regex: string; $options: string };
  isActive?: boolean;
  emailVerified?: boolean;
  createdAt?: Date | { $gte?: Date; $lte?: Date };
  updatedAt?: Date | { $gte?: Date; $lte?: Date };
  $or?: Array<{
    email?: { $regex: string; $options: string };
    firstName?: { $regex: string; $options: string };
    lastName?: { $regex: string; $options: string };
  }>;
}

/**
 * Policy-specific filter conditions
 */
export interface PolicyFilterConditions {
  _id?: string | { $in: string[] };
  name?: string | { $regex: string; $options: string };
  description?: string | { $regex: string; $options: string };
  isActive?: boolean;
  effect?: 'allow' | 'deny';
  priority?: number | { $gte?: number; $lte?: number };
  version?: number;
  createdAt?: Date | { $gte?: Date; $lte?: Date };
  updatedAt?: Date | { $gte?: Date; $lte?: Date };
  $or?: Array<{
    name?: { $regex: string; $options: string };
    description?: { $regex: string; $options: string };
  }>;
}

/**
 * MongoDB sort options
 */
export interface MongoSortOptions {
  [key: string]: 1 | -1;
}

/**
 * User attributes for policy conditions
 */
export interface UserAttributes {
  department?: string;
  level?: 'junior' | 'senior' | 'lead' | 'manager';
  role?: string;
  groups?: string[];
  permissions?: string[];
  location?: string;
  timezone?: string;
  [key: string]: string | string[] | number | boolean | undefined;
}

/**
 * Resource attributes for policy conditions
 */
export interface ResourceAttributes {
  ownerId?: string;
  status?: 'draft' | 'published' | 'archived' | 'deleted';
  visibility?: 'public' | 'private' | 'internal';
  category?: string;
  tags?: string[];
  createdBy?: string;
  department?: string;
  [key: string]: string | string[] | number | boolean | undefined;
}

/**
 * Environment attributes for policy conditions
 */
export interface EnvironmentAttributes {
  timeRange?: {
    start?: string; // HH:mm format
    end?: string;   // HH:mm format
  };
  ipWhitelist?: string[];
  ipBlacklist?: string[];
  location?: string[];
  userAgent?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  [key: string]: string | string[] | number | boolean | object | undefined;
}

/**
 * Custom attributes for policy conditions
 */
export interface CustomAttributes {
  [key: string]: string | string[] | number | boolean | object | undefined;
}

/**
 * User profile preferences
 */
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  timezone?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  privacy?: {
    profileVisibility?: 'public' | 'private' | 'friends';
    showEmail?: boolean;
    showPhone?: boolean;
  };
  dashboard?: {
    layout?: 'grid' | 'list';
    itemsPerPage?: number;
    defaultView?: string;
  };
  [key: string]: string | number | boolean | object | undefined;
}

/**
 * Role metadata
 */
export interface RoleMetadata {
  level?: 'system' | 'organization' | 'department' | 'team';
  category?: string;
  description?: string;
  permissions?: string[];
  restrictions?: string[];
  [key: string]: string | string[] | number | boolean | undefined;
}

/**
 * Activity log metadata
 */
export interface ActivityLogMetadata {
  action?: string;
  resource?: string;
  resourceId?: string;
  changes?: {
    field: string;
    oldValue?: unknown;
    newValue?: unknown;
  }[];
  context?: {
    userAgent?: string;
    ipAddress?: string;
    location?: string;
    sessionId?: string;
  };
  [key: string]: unknown;
}

/**
 * API error details
 */
export interface ApiErrorDetails {
  field?: string;
  code?: string;
  message?: string;
  value?: unknown;
  constraints?: Record<string, string>;
  children?: ApiErrorDetails[];
  [key: string]: unknown;
}

/**
 * Hono environment bindings
 */
export interface HonoBindings {
  // Environment variables
  NODE_ENV?: string;
  PORT?: string;
  DATABASE_URL?: string;
  JWT_SECRET?: string;
  JWT_REFRESH_SECRET?: string;
  
  // External services
  REDIS_URL?: string;
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USER?: string;
  SMTP_PASSWORD?: string;
  
  // Feature flags
  API_DOCS_ENABLED?: string;
  RATE_LIMIT_ENABLED?: string;
  
  [key: string]: string | undefined;
}

/**
 * MongoDB aggregation pipeline stage
 */
export interface MongoAggregationStage {
  $match?: MongoFilterConditions;
  $sort?: MongoSortOptions;
  $limit?: number;
  $skip?: number;
  $lookup?: {
    from: string;
    localField: string;
    foreignField: string;
    as: string;
  };
  $unwind?: string | {
    path: string;
    preserveNullAndEmptyArrays?: boolean;
  };
  $group?: {
    _id: string | null;
    [key: string]: unknown;
  };
  $project?: {
    [key: string]: 0 | 1 | string | object;
  };
  [key: string]: unknown;
}

/**
 * Database update operations
 */
export interface MongoUpdateOperations {
  $set?: Record<string, unknown>;
  $unset?: Record<string, 1>;
  $inc?: Record<string, number>;
  $push?: Record<string, unknown>;
  $pull?: Record<string, unknown>;
  $addToSet?: Record<string, unknown>;
  [key: string]: unknown;
}
