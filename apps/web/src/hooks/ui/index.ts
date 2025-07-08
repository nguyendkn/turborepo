/**
 * UI Hooks Index
 * Centralized exports for all UI interaction hooks
 */

// Form management hooks
export * from './use-form';

// Table management hooks
export * from './use-table';

// Modal management hooks
export * from './use-modal';

// Notification management hooks
export * from './use-notifications';

// Error handling hooks
export * from './use-error-handler';

// Network status hooks
export * from './use-network-status';

/**
 * Re-export commonly used types for convenience
 */
export type { FormState, TableState, ModalState, Notification } from '@/types';
