import type { RoleMetadata } from './database';
import type { Policy } from './policy';

/**
 * Dynamic role definition
 */
export interface Role {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  isSystemRole: boolean;
  policies: Policy[];
  metadata?: RoleMetadata;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}
