/**
 * Retry Button Component
 * Provides retry functionality with exponential backoff and loading states
 */

import { useState, useCallback } from 'react';

import { LoadingSpinner } from './loading-spinner';

/**
 * Retry button props interface
 */
export interface RetryButtonProps {
  onRetry: () => Promise<void> | void;
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  showRetryCount?: boolean;
  resetOnSuccess?: boolean;
}

/**
 * Retry button component with exponential backoff
 */
export const RetryButton = ({
  onRetry,
  maxRetries = 3,
  initialDelay = 1000,
  maxDelay = 10000,
  backoffMultiplier = 2,
  disabled = false,
  className = '',
  children = 'Retry',
  showRetryCount = true,
  resetOnSuccess = true,
}: RetryButtonProps) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [nextRetryIn, setNextRetryIn] = useState<number | null>(null);

  const calculateDelay = useCallback(
    (attempt: number) => {
      const delay = Math.min(
        initialDelay * Math.pow(backoffMultiplier, attempt),
        maxDelay
      );
      return delay;
    },
    [initialDelay, backoffMultiplier, maxDelay]
  );

  const handleRetry = useCallback(async () => {
    if (disabled || isRetrying || retryCount >= maxRetries) {
      return;
    }

    setIsRetrying(true);

    try {
      await onRetry();

      if (resetOnSuccess) {
        setRetryCount(0);
      }
    } catch {
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);

      if (newRetryCount < maxRetries) {
        const delay = calculateDelay(newRetryCount - 1);
        setNextRetryIn(delay);

        // Countdown timer
        const startTime = Date.now();
        const countdownInterval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(0, delay - elapsed);

          if (remaining <= 0) {
            clearInterval(countdownInterval);
            setNextRetryIn(null);
          } else {
            setNextRetryIn(remaining);
          }
        }, 100);

        // Auto-retry after delay
        setTimeout(() => {
          clearInterval(countdownInterval);
          setNextRetryIn(null);
          setIsRetrying(false);
        }, delay);
      } else {
        setIsRetrying(false);
      }
    } finally {
      if (retryCount + 1 >= maxRetries || resetOnSuccess) {
        setIsRetrying(false);
      }
    }
  }, [
    disabled,
    isRetrying,
    retryCount,
    maxRetries,
    onRetry,
    resetOnSuccess,
    calculateDelay,
  ]);

  const isDisabled = disabled || isRetrying || retryCount >= maxRetries;
  const hasReachedMaxRetries = retryCount >= maxRetries;

  const getButtonText = () => {
    if (nextRetryIn !== null) {
      const seconds = Math.ceil(nextRetryIn / 1000);
      return `Retrying in ${seconds}s...`;
    }

    if (isRetrying) {
      return 'Retrying...';
    }

    if (hasReachedMaxRetries) {
      return 'Max retries reached';
    }

    if (showRetryCount && retryCount > 0) {
      return `${children} (${retryCount}/${maxRetries})`;
    }

    return children;
  };

  return (
    <div className='flex flex-col items-center space-y-2'>
      <button
        onClick={handleRetry}
        disabled={isDisabled}
        className={`
          flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md
          transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
          ${
            isDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
          }
          ${className}
        `}
      >
        {isRetrying && nextRetryIn === null && (
          <LoadingSpinner size='sm' color='white' className='mr-2' />
        )}
        {getButtonText()}
      </button>

      {showRetryCount && retryCount > 0 && !hasReachedMaxRetries && (
        <p className='text-xs text-gray-500'>
          {maxRetries - retryCount} attempts remaining
        </p>
      )}

      {hasReachedMaxRetries && (
        <p className='text-xs text-red-500'>
          Maximum retry attempts reached. Please refresh the page or contact
          support.
        </p>
      )}
    </div>
  );
};

/**
 * Simple retry button without exponential backoff
 */
export interface SimpleRetryButtonProps {
  onRetry: () => Promise<void> | void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const SimpleRetryButton = ({
  onRetry,
  disabled = false,
  className = '',
  children = 'Try Again',
}: SimpleRetryButtonProps) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (disabled || isRetrying) {
      return;
    }

    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <button
      onClick={handleRetry}
      disabled={disabled || isRetrying}
      className={`
        flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md
        transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
        ${
          disabled || isRetrying
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
        }
        ${className}
      `}
    >
      {isRetrying && (
        <LoadingSpinner size='sm' color='white' className='mr-2' />
      )}
      {isRetrying ? 'Retrying...' : children}
    </button>
  );
};

/**
 * Error message with retry button
 */
export interface ErrorWithRetryProps {
  error: string | Error;
  onRetry: () => Promise<void> | void;
  title?: string;
  className?: string;
  showErrorDetails?: boolean;
}

export const ErrorWithRetry = ({
  error,
  onRetry,
  title = 'Something went wrong',
  className = '',
  showErrorDetails = false,
}: ErrorWithRetryProps) => {
  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <div className={`text-center py-8 ${className}`}>
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

      <h3 className='text-lg font-medium text-gray-900 mb-2'>{title}</h3>

      {showErrorDetails && (
        <p className='text-sm text-gray-600 mb-4'>{errorMessage}</p>
      )}

      <SimpleRetryButton onRetry={onRetry} />
    </div>
  );
};
