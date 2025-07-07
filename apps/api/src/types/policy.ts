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
    attributes?: Record<string, unknown>;
    groups?: string[];
  };
  resource?: {
    type?: string;
    attributes?: Record<string, unknown>;
  };
  environment?: {
    time?: {
      start?: string;
      end?: string;
    };
    location?: string[];
    ipRange?: string[];
  };
  custom?: Record<string, unknown>;
}
