/**
 * PBAC Policy definition
 */
export interface Policy {
  id: string;
  name: string;
  description?: string;
  version: number;
  isActive: boolean;
  conditions: PolicyConditions;
  actions: string[];
  resources: string[];
  effect: 'allow' | 'deny';
  priority: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
}

/**
 * Policy conditions for evaluation
 */
export interface PolicyConditions {
  user?: {
    attributes?: UserAttributes;
    groups?: string[];
  };
  resource?: {
    type?: string;
    attributes?: ResourceAttributes;
  };
  environment?: EnvironmentAttributes;
  custom?: CustomAttributes;
}

// Import the specific attribute types
import type {
  UserAttributes,
  ResourceAttributes,
  EnvironmentAttributes,
  CustomAttributes
} from './database';
