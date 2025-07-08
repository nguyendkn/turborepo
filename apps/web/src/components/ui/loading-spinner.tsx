/**
 * Loading Spinner Components
 * Various loading indicators for different use cases
 */

import { type ReactNode } from 'react';

/**
 * Basic loading spinner
 */
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'secondary' | 'white' | 'gray';
  className?: string;
}

export const LoadingSpinner = ({
  size = 'md',
  color = 'primary',
  className = '',
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'text-blue-600',
    secondary: 'text-gray-600',
    white: 'text-white',
    gray: 'text-gray-400',
  };

  return (
    <svg
      className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      fill='none'
      viewBox='0 0 24 24'
    >
      <circle
        className='opacity-25'
        cx='12'
        cy='12'
        r='10'
        stroke='currentColor'
        strokeWidth='4'
      />
      <path
        className='opacity-75'
        fill='currentColor'
        d='m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
      />
    </svg>
  );
};

/**
 * Loading overlay component
 */
export interface LoadingOverlayProps {
  isLoading: boolean;
  children: ReactNode;
  message?: string;
  className?: string;
}

export const LoadingOverlay = ({
  isLoading,
  children,
  message = 'Loading...',
  className = '',
}: LoadingOverlayProps) => {
  return (
    <div className={`relative ${className}`}>
      {children}
      {isLoading && (
        <div className='absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10'>
          <div className='flex flex-col items-center space-y-3'>
            <LoadingSpinner size='lg' />
            <p className='text-sm text-gray-600'>{message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Button loading state
 */
export interface LoadingButtonProps {
  isLoading: boolean;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export const LoadingButton = ({
  isLoading,
  children,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
}: LoadingButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`relative flex items-center justify-center ${className} ${
        disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {isLoading && <LoadingSpinner size='sm' color='white' className='mr-2' />}
      {children}
    </button>
  );
};

/**
 * Page loading component
 */
export interface PageLoadingProps {
  message?: string;
  className?: string;
}

export const PageLoading = ({
  message = 'Loading page...',
  className = '',
}: PageLoadingProps) => {
  return (
    <div
      className={`flex items-center justify-center min-h-screen ${className}`}
    >
      <div className='flex flex-col items-center space-y-4'>
        <LoadingSpinner size='xl' />
        <p className='text-lg text-gray-600'>{message}</p>
      </div>
    </div>
  );
};

/**
 * Inline loading component
 */
export interface InlineLoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const InlineLoading = ({
  message = 'Loading...',
  size = 'sm',
  className = '',
}: InlineLoadingProps) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <LoadingSpinner size={size} />
      <span className='text-sm text-gray-600'>{message}</span>
    </div>
  );
};

/**
 * Skeleton loading components
 */
export const SkeletonLine = ({
  width = '100%',
  height = '1rem',
  className = '',
}: {
  width?: string;
  height?: string;
  className?: string;
}) => (
  <div
    className={`bg-gray-200 rounded animate-pulse ${className}`}
    style={{ width, height }}
  />
);

export const SkeletonCircle = ({
  size = '2rem',
  className = '',
}: {
  size?: string;
  className?: string;
}) => (
  <div
    className={`bg-gray-200 rounded-full animate-pulse ${className}`}
    style={{ width: size, height: size }}
  />
);

export const SkeletonCard = ({ className = '' }: { className?: string }) => (
  <div className={`p-4 border border-gray-200 rounded-lg ${className}`}>
    <div className='space-y-3'>
      <SkeletonLine width='75%' height='1.25rem' />
      <SkeletonLine width='100%' height='0.875rem' />
      <SkeletonLine width='60%' height='0.875rem' />
    </div>
  </div>
);

export const SkeletonTable = ({
  rows = 5,
  columns = 4,
  className = '',
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) => (
  <div className={`space-y-3 ${className}`}>
    {/* Header */}
    <div
      className='grid gap-4'
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {Array.from({ length: columns }).map((_, i) => (
        <SkeletonLine key={i} height='1.5rem' />
      ))}
    </div>

    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div
        key={rowIndex}
        className='grid gap-4'
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {Array.from({ length: columns }).map((_, colIndex) => (
          <SkeletonLine key={colIndex} height='1rem' />
        ))}
      </div>
    ))}
  </div>
);
