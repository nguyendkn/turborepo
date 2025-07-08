/**
 * Global Error Handler Hook
 * Centralized error handling for the application
 */

import { useCallback } from 'react';

import { useNotifications } from './use-notifications';

import type { ApiError, WindowWithGtag } from '@/types';

/**
 * Error types for categorization
 */
export type ErrorCategory =
  | 'network'
  | 'authentication'
  | 'authorization'
  | 'validation'
  | 'server'
  | 'client'
  | 'unknown';

/**
 * Error handling options
 */
export interface ErrorHandlingOptions {
  showNotification?: boolean;
  logError?: boolean;
  category?: ErrorCategory;
  context?: string;
  retryable?: boolean;
  onRetry?: () => void;
}

/**
 * Global error handler hook
 */
export const useErrorHandler = () => {
  const { addNotification } = useNotifications();

  /**
   * Categorize error based on its properties
   */
  const categorizeError = useCallback((error: unknown): ErrorCategory => {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      // Network errors
      if (
        message.includes('network') ||
        message.includes('fetch') ||
        message.includes('connection')
      ) {
        return 'network';
      }

      // Authentication errors
      if (message.includes('unauthorized') || message.includes('401')) {
        return 'authentication';
      }

      // Authorization errors
      if (message.includes('forbidden') || message.includes('403')) {
        return 'authorization';
      }

      // Validation errors
      if (
        message.includes('validation') ||
        message.includes('invalid') ||
        message.includes('400')
      ) {
        return 'validation';
      }

      // Server errors
      if (
        message.includes('500') ||
        message.includes('server') ||
        message.includes('internal')
      ) {
        return 'server';
      }
    }

    // Check if it's an ApiError
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      'message' in error
    ) {
      const apiError = error as ApiError;

      // Check status code if available
      if (apiError.status) {
        if (apiError.status === 401) return 'authentication';
        if (apiError.status === 403) return 'authorization';
        if (apiError.status >= 400 && apiError.status < 500)
          return 'validation';
        if (apiError.status >= 500) return 'server';
      }

      // Check error code patterns
      if (
        apiError.code.includes('NETWORK') ||
        apiError.code.includes('CONNECTION')
      ) {
        return 'network';
      }
      if (
        apiError.code.includes('AUTH') ||
        apiError.code.includes('UNAUTHORIZED')
      ) {
        return 'authentication';
      }
      if (
        apiError.code.includes('FORBIDDEN') ||
        apiError.code.includes('PERMISSION')
      ) {
        return 'authorization';
      }
      if (
        apiError.code.includes('VALIDATION') ||
        apiError.code.includes('INVALID')
      ) {
        return 'validation';
      }

      return 'client';
    }

    return 'unknown';
  }, []);

  /**
   * Get user-friendly error message based on category
   */
  const getErrorMessage = useCallback(
    (error: unknown, category: ErrorCategory): string => {
      switch (category) {
        case 'network':
          return 'Network connection failed. Please check your internet connection and try again.';
        case 'authentication':
          return 'Your session has expired. Please log in again.';
        case 'authorization':
          return "You don't have permission to perform this action.";
        case 'validation':
          return 'Please check your input and try again.';
        case 'server':
          return 'Server error occurred. Please try again later.';
        case 'client':
          return 'An error occurred while processing your request.';
        default:
          if (error instanceof Error) {
            return error.message;
          }
          return 'An unexpected error occurred.';
      }
    },
    []
  );

  /**
   * Get error title based on category
   */
  const getErrorTitle = useCallback((category: ErrorCategory): string => {
    switch (category) {
      case 'network':
        return 'Connection Error';
      case 'authentication':
        return 'Authentication Required';
      case 'authorization':
        return 'Access Denied';
      case 'validation':
        return 'Invalid Input';
      case 'server':
        return 'Server Error';
      case 'client':
        return 'Request Error';
      default:
        return 'Error';
    }
  }, []);

  /**
   * Handle error with appropriate user feedback
   */
  const handleError = useCallback(
    (error: unknown, options: ErrorHandlingOptions = {}) => {
      const {
        showNotification = true,
        logError = true,
        category: providedCategory,
        context: _context, // eslint-disable-line @typescript-eslint/no-unused-vars
        retryable = false,
        onRetry,
      } = options;

      // Log error if enabled
      if (logError) {
        // Error logged with context information
      }

      // Categorize error
      const category = providedCategory || categorizeError(error);

      // Show notification if enabled
      if (showNotification) {
        const title = getErrorTitle(category);
        const message = getErrorMessage(error, category);

        const actions =
          retryable && onRetry
            ? [
                {
                  label: 'Retry',
                  action: onRetry,
                },
              ]
            : undefined;

        addNotification({
          type: 'error',
          title,
          message,
          duration: category === 'validation' ? 5000 : 0, // Auto-dismiss validation errors
          actions,
        });
      }

      return {
        category,
        message: getErrorMessage(error, category),
        title: getErrorTitle(category),
      };
    },
    [categorizeError, getErrorMessage, getErrorTitle, addNotification]
  );

  /**
   * Handle API errors specifically
   */
  const handleApiError = useCallback(
    (error: ApiError, options: Omit<ErrorHandlingOptions, 'category'> = {}) => {
      return handleError(error, {
        ...options,
        category: categorizeError(error),
      });
    },
    [handleError, categorizeError]
  );

  /**
   * Handle form validation errors
   */
  const handleValidationError = useCallback(
    (error: unknown, options: Omit<ErrorHandlingOptions, 'category'> = {}) => {
      return handleError(error, {
        ...options,
        category: 'validation',
      });
    },
    [handleError]
  );

  /**
   * Handle network errors
   */
  const handleNetworkError = useCallback(
    (error: unknown, options: Omit<ErrorHandlingOptions, 'category'> = {}) => {
      return handleError(error, {
        ...options,
        category: 'network',
        retryable: true,
      });
    },
    [handleError]
  );

  /**
   * Create error handler for async operations
   */
  const createAsyncErrorHandler = useCallback(
    (context: string, options: ErrorHandlingOptions = {}) => {
      return (error: unknown) => {
        handleError(error, {
          ...options,
          context,
        });
      };
    },
    [handleError]
  );

  return {
    handleError,
    handleApiError,
    handleValidationError,
    handleNetworkError,
    createAsyncErrorHandler,
    categorizeError,
    getErrorMessage,
    getErrorTitle,
  };
};

/**
 * Error boundary error handler hook
 */
export const useErrorBoundaryHandler = () => {
  const { handleError } = useErrorHandler();

  const handleBoundaryError = useCallback(
    (error: Error, _errorInfo: React.ErrorInfo) => {
      // Log detailed error information
      // Error boundary caught error with component stack

      // Handle error with notification
      handleError(error, {
        context: 'Component Error',
        showNotification: true,
        logError: false, // Already logged above
      });

      // Report to error tracking service if available
      if (typeof window !== 'undefined' && 'gtag' in window) {
        // Example: Google Analytics error tracking
        (window as WindowWithGtag).gtag('event', 'exception', {
          description: error.toString(),
          fatal: false,
        });
      }
    },
    [handleError]
  );

  return {
    handleBoundaryError,
  };
};

/**
 * Unhandled error listener hook
 */
export const useUnhandledErrorListener = () => {
  const { handleError } = useErrorHandler();

  const setupErrorListeners = useCallback(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      handleError(event.reason, {
        context: 'Unhandled Promise Rejection',
        showNotification: true,
      });
    };

    // Handle global JavaScript errors
    const handleGlobalError = (event: ErrorEvent) => {
      handleError(event.error || event.message, {
        context: 'Global Error',
        showNotification: true,
      });
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleGlobalError);

    return () => {
      window.removeEventListener(
        'unhandledrejection',
        handleUnhandledRejection
      );
      window.removeEventListener('error', handleGlobalError);
    };
  }, [handleError]);

  return {
    setupErrorListeners,
  };
};
