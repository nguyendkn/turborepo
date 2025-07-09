import type { Role } from './role';
import type { UserAttributes } from './database';

/**
 * User type for authentication
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: Role[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  attributes?: UserAttributes;
}
