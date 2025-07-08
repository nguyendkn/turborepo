/**
 * Alert Component
 * Reusable alert component for displaying messages and notifications
 */

import React from 'react';

import { IconButton } from './button';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}

const variantClasses: Record<AlertVariant, string> = {
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  success: 'bg-green-50 border-green-200 text-green-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  danger: 'bg-red-50 border-red-200 text-red-800',
};

const iconClasses: Record<AlertVariant, string> = {
  info: 'text-blue-400',
  success: 'text-green-400',
  warning: 'text-yellow-400',
  danger: 'text-red-400',
};

const defaultIcons: Record<AlertVariant, React.ReactNode> = {
  info: (
    <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
      <path
        fillRule='evenodd'
        d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
        clipRule='evenodd'
      />
    </svg>
  ),
  success: (
    <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
      <path
        fillRule='evenodd'
        d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
        clipRule='evenodd'
      />
    </svg>
  ),
  warning: (
    <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
      <path
        fillRule='evenodd'
        d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
        clipRule='evenodd'
      />
    </svg>
  ),
  danger: (
    <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
      <path
        fillRule='evenodd'
        d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
        clipRule='evenodd'
      />
    </svg>
  ),
};

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onClose,
  className = '',
  icon,
  actions,
}) => {
  const alertIcon = icon !== undefined ? icon : defaultIcons[variant];

  return (
    <div
      className={`border rounded-md p-4 ${variantClasses[variant]} ${className}`}
    >
      <div className='flex'>
        {alertIcon && (
          <div className='flex-shrink-0'>
            <div className={iconClasses[variant]}>{alertIcon}</div>
          </div>
        )}

        <div className={`${alertIcon ? 'ml-3' : ''} flex-1`}>
          {title && <h3 className='text-sm font-medium mb-1'>{title}</h3>}

          <div className='text-sm'>{children}</div>

          {actions && <div className='mt-3'>{actions}</div>}
        </div>

        {onClose && (
          <div className='ml-auto pl-3'>
            <div className='-mx-1.5 -my-1.5'>
              <IconButton
                icon={
                  <svg
                    className='w-4 h-4'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                }
                onClick={onClose}
                variant='ghost'
                size='sm'
                className={`${iconClasses[variant]} hover:bg-opacity-20`}
                aria-label='Close alert'
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Alert List Component
 */
export interface AlertListProps {
  alerts: Array<{
    id: string;
    variant?: AlertVariant;
    title?: string;
    message: string;
    onClose?: () => void;
  }>;
  className?: string;
}

export const AlertList: React.FC<AlertListProps> = ({
  alerts,
  className = '',
}) => (
  <div className={`space-y-3 ${className}`}>
    {alerts.map(alert => (
      <Alert
        key={alert.id}
        variant={alert.variant}
        title={alert.title}
        onClose={alert.onClose}
      >
        {alert.message}
      </Alert>
    ))}
  </div>
);

/**
 * Inline Alert Component
 */
export interface InlineAlertProps {
  variant?: AlertVariant;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

export const InlineAlert: React.FC<InlineAlertProps> = ({
  variant = 'info',
  children,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
  };

  return (
    <div
      className={`inline-flex items-center rounded ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      <div className={`mr-2 ${iconClasses[variant]}`}>
        {defaultIcons[variant]}
      </div>
      {children}
    </div>
  );
};

/**
 * Banner Alert Component
 */
export interface BannerAlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

export const BannerAlert: React.FC<BannerAlertProps> = ({
  variant = 'info',
  title,
  children,
  onClose,
  actions,
  className = '',
}) => (
  <div className={`${variantClasses[variant]} ${className}`}>
    <div className='max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8'>
      <div className='flex items-center justify-between flex-wrap'>
        <div className='w-0 flex-1 flex items-center'>
          <span className={`flex p-2 rounded-lg ${iconClasses[variant]}`}>
            {defaultIcons[variant]}
          </span>
          <div className='ml-3'>
            {title && <p className='font-medium text-sm'>{title}</p>}
            <p className='text-sm'>{children}</p>
          </div>
        </div>

        {actions && (
          <div className='order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto'>
            {actions}
          </div>
        )}

        {onClose && (
          <div className='order-2 flex-shrink-0 sm:order-3 sm:ml-3'>
            <IconButton
              icon={
                <svg
                  className='w-4 h-4'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              }
              onClick={onClose}
              variant='ghost'
              size='sm'
              className={`${iconClasses[variant]} hover:bg-opacity-20`}
              aria-label='Close banner'
            />
          </div>
        )}
      </div>
    </div>
  </div>
);
