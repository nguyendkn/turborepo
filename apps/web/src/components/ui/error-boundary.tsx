/**
 * Error Boundary Components
 * React error boundaries for catching and handling component errors
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';

import { appActions } from '@/store';

/**
 * Error boundary state interface
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error boundary props interface
 */
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

/**
 * Main error boundary component
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (import.meta.env.DEV) {
      // Error logged in development mode
    }

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Add error notification
    appActions.addNotification({
      type: 'error',
      title: 'Application Error',
      message: 'An unexpected error occurred. Please try refreshing the page.',
      duration: 0, // Don't auto-dismiss
      actions: [
        {
          label: 'Refresh Page',
          action: () => window.location.reload(),
        },
        {
          label: 'Report Issue',
          action: () => {
            // You can implement error reporting here
            // Report issue functionality would be implemented here
          },
        },
      ],
    });
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetOnPropsChange, resetKeys } = this.props;
    const { hasError } = this.state;

    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetOnPropsChange) {
        this.resetErrorBoundary();
      }
    }
  }

  resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.resetTimeoutId = window.setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
      });
    }, 100);
  };

  render() {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      if (fallback) {
        return fallback;
      }

      return (
        <ErrorFallback
          error={error}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      );
    }

    return children;
  }
}

/**
 * Default error fallback component
 */
interface ErrorFallbackProps {
  error: Error | null;
  resetErrorBoundary: () => void;
}

export const ErrorFallback = ({
  error,
  resetErrorBoundary,
}: ErrorFallbackProps) => {
  const handleReportError = () => {
    // Implement error reporting logic here
    // Error reporting logic would be implemented here

    appActions.addNotification({
      type: 'info',
      title: 'Error Reported',
      message:
        'Thank you for reporting this issue. Our team has been notified.',
      duration: 5000,
    });
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div className='text-center'>
          <div className='mx-auto h-12 w-12 text-red-500'>
            <svg fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
          </div>
          <h2 className='mt-6 text-3xl font-extrabold text-gray-900'>
            Oops! Something went wrong
          </h2>
          <p className='mt-2 text-sm text-gray-600'>
            We&apos;re sorry, but an unexpected error occurred. Please try
            again.
          </p>

          {import.meta.env.DEV && error && (
            <details className='mt-4 text-left'>
              <summary className='cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900'>
                Error Details (Development)
              </summary>
              <pre className='mt-2 text-xs text-red-600 bg-red-50 p-3 rounded border overflow-auto max-h-40'>
                {error.toString()}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}
        </div>

        <div className='space-y-3'>
          <button
            onClick={resetErrorBoundary}
            className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            Try Again
          </button>

          <button
            onClick={() => window.location.reload()}
            className='group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            Refresh Page
          </button>

          <button
            onClick={handleReportError}
            className='group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            Report Issue
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Route error boundary for TanStack Router
 */
export const RouteErrorBoundary = ({ error }: { error: Error }) => {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='max-w-md w-full text-center'>
        <div className='mx-auto h-12 w-12 text-red-500 mb-4'>
          <svg fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z'
            />
          </svg>
        </div>
        <h1 className='text-2xl font-bold text-gray-900 mb-2'>Page Error</h1>
        <p className='text-gray-600 mb-6'>
          Sorry, we couldn&apos;t load this page. Please try again.
        </p>

        {import.meta.env.DEV && (
          <details className='mb-6 text-left'>
            <summary className='cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900'>
              Error Details (Development)
            </summary>
            <pre className='mt-2 text-xs text-red-600 bg-red-50 p-3 rounded border overflow-auto max-h-40'>
              {error.toString()}
            </pre>
          </details>
        )}

        <div className='space-y-3'>
          <button
            onClick={() => window.location.reload()}
            className='w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            Refresh Page
          </button>

          <button
            onClick={() => window.history.back()}
            className='w-full py-2 px-4 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};
