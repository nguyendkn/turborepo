/**
 * Notifications Management Hook
 * Custom hook for notification state management
 */

import { useStore } from '@tanstack/react-store';
import { useCallback } from 'react';

import { appActions } from '@/store';
import { appStore } from '@/store/app-store';
import type { Notification } from '@/types';

/**
 * Notification hook for managing app-wide notifications
 */
export const useNotifications = () => {
  const notifications = useStore(appStore, state => state.notifications);

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id'>) => {
      return appActions.addNotification(notification);
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    appActions.removeNotification(id);
  }, []);

  const clearNotifications = useCallback(() => {
    appActions.clearNotifications();
  }, []);

  // Convenience methods for different notification types
  const success = useCallback(
    (message: string, title?: string, duration?: number) => {
      return addNotification({
        type: 'success',
        title: title || 'Success',
        message,
        duration,
      });
    },
    [addNotification]
  );

  const error = useCallback(
    (message: string, title?: string, duration?: number) => {
      return addNotification({
        type: 'error',
        title: title || 'Error',
        message,
        duration: duration || 0, // Error notifications don't auto-dismiss by default
      });
    },
    [addNotification]
  );

  const warning = useCallback(
    (message: string, title?: string, duration?: number) => {
      return addNotification({
        type: 'warning',
        title: title || 'Warning',
        message,
        duration,
      });
    },
    [addNotification]
  );

  const info = useCallback(
    (message: string, title?: string, duration?: number) => {
      return addNotification({
        type: 'info',
        title: title || 'Information',
        message,
        duration,
      });
    },
    [addNotification]
  );

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    success,
    error,
    warning,
    info,
  };
};

/**
 * Toast notification hook with auto-dismiss
 */
export const useToast = () => {
  const { success, error, warning, info } = useNotifications();

  const toast = useCallback(
    (
      type: 'success' | 'error' | 'warning' | 'info',
      message: string,
      options?: {
        title?: string;
        duration?: number;
        action?: {
          label: string;
          onClick: () => void;
        };
      }
    ) => {
      switch (type) {
        case 'success':
          return success(message, options?.title, options?.duration);
        case 'error':
          return error(message, options?.title, options?.duration);
        case 'warning':
          return warning(message, options?.title, options?.duration);
        case 'info':
          return info(message, options?.title, options?.duration);
        default:
          return info(message, options?.title, options?.duration);
      }
    },
    [success, error, warning, info]
  );

  return {
    toast,
    success: (
      message: string,
      options?: { title?: string; duration?: number }
    ) => toast('success', message, options),
    error: (message: string, options?: { title?: string; duration?: number }) =>
      toast('error', message, options),
    warning: (
      message: string,
      options?: { title?: string; duration?: number }
    ) => toast('warning', message, options),
    info: (message: string, options?: { title?: string; duration?: number }) =>
      toast('info', message, options),
  };
};

/**
 * Progress notification hook for long-running operations
 */
export const useProgressNotification = () => {
  const { addNotification, removeNotification } = useNotifications();

  const showProgress = useCallback(
    (
      message: string,
      options?: {
        title?: string;
        progress?: number;
        indeterminate?: boolean;
      }
    ) => {
      return addNotification({
        type: 'info',
        title: options?.title || 'Processing...',
        message,
        duration: 0, // Don't auto-dismiss
        progress: options?.progress,
        indeterminate: options?.indeterminate,
      });
    },
    [addNotification]
  );

  const updateProgress = useCallback(
    (id: string, progress: number, message?: string) => {
      // Remove old notification and add updated one
      removeNotification(id);
      return addNotification({
        type: 'info',
        title: 'Processing...',
        message: message || 'Processing...',
        duration: 0,
        progress,
      });
    },
    [addNotification, removeNotification]
  );

  const completeProgress = useCallback(
    (id: string, successMessage?: string) => {
      removeNotification(id);
      if (successMessage) {
        return addNotification({
          type: 'success',
          title: 'Completed',
          message: successMessage,
          duration: 3000,
        });
      }
    },
    [addNotification, removeNotification]
  );

  const failProgress = useCallback(
    (id: string, errorMessage?: string) => {
      removeNotification(id);
      if (errorMessage) {
        return addNotification({
          type: 'error',
          title: 'Failed',
          message: errorMessage,
          duration: 0,
        });
      }
    },
    [addNotification, removeNotification]
  );

  return {
    showProgress,
    updateProgress,
    completeProgress,
    failProgress,
  };
};

/**
 * Bulk operation notification hook
 */
export const useBulkNotification = () => {
  const { addNotification } = useNotifications();

  const notifyBulkOperation = useCallback(
    (operation: string, _total: number, successful: number, failed: number) => {
      if (failed === 0) {
        // All successful
        addNotification({
          type: 'success',
          title: 'Bulk Operation Completed',
          message: `Successfully ${operation} ${successful} item${successful !== 1 ? 's' : ''}.`,
          duration: 5000,
        });
      } else if (successful === 0) {
        // All failed
        addNotification({
          type: 'error',
          title: 'Bulk Operation Failed',
          message: `Failed to ${operation} ${failed} item${failed !== 1 ? 's' : ''}.`,
          duration: 0,
        });
      } else {
        // Partial success
        addNotification({
          type: 'warning',
          title: 'Bulk Operation Partially Completed',
          message: `${operation} ${successful} item${successful !== 1 ? 's' : ''} successfully, ${failed} failed.`,
          duration: 8000,
        });
      }
    },
    [addNotification]
  );

  return {
    notifyBulkOperation,
  };
};
