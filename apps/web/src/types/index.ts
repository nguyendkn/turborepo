/**
 * Type definitions index
 * Re-exports all types for easy importing
 */

// API types
export * from './api';

// Authentication types
export * from './auth';

// User types
export * from './user';

// Role types
export * from './role';

// Policy types
export * from './policy';

// Permission types
export * from './permission';

/**
 * Common utility types
 */

/**
 * Generic form state
 */
export interface FormState<T = Record<string, unknown>> {
  data: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

/**
 * Generic loading state
 */
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

/**
 * Form field configuration
 */
export interface FormFieldConfig {
  name: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'checkbox' | 'textarea';
  label: string;
  placeholder?: string;
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: unknown) => string | null;
  };
}

/**
 * Form validation result
 */
export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Network status information
 */
export interface NetworkStatus {
  isOnline: boolean;
  isSlowConnection: boolean;
  connectionType?: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  effectiveType?: '2g' | '3g' | '4g' | 'slow-2g';
}

/**
 * Window with gtag for analytics
 */
export interface WindowWithGtag {
  gtag: (command: string, action: string, parameters: Record<string, unknown>) => void;
}

/**
 * Route search parameters (for TanStack Router)
 */
export interface RouteSearchParams {
  redirect?: string;
  [key: string]: string | undefined;
}

/**
 * Generic table state
 */
export interface TableState<T = unknown> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  sorting: {
    field: string;
    direction: 'asc' | 'desc';
  };
  filters: Record<string, unknown>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Modal state
 */
export interface ModalState {
  isOpen: boolean;
  title?: string;
  content?: React.ReactNode;
  onClose?: () => void;
}

/**
 * Notification types
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  progress?: number;
  indeterminate?: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

/**
 * Theme types
 */
export type Theme = 'light' | 'dark' | 'system';

/**
 * Application configuration
 */
export interface AppConfig {
  apiBaseUrl: string;
  environment: 'development' | 'staging' | 'production';
  version: string;
  features: {
    [key: string]: boolean;
  };
}
