/**
 * Card Component
 * Reusable card component for content containers
 */

import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  border?: boolean;
  hover?: boolean;
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};

const shadowClasses = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
};

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  shadow = 'md',
  border = true,
  hover = false,
}) => {
  const cardClasses = [
    'bg-white rounded-lg',
    paddingClasses[padding],
    shadowClasses[shadow],
    border ? 'border border-gray-200' : '',
    hover ? 'transition-shadow duration-200 hover:shadow-lg' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={cardClasses}>{children}</div>;
};

/**
 * Card Header Component
 */
export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  border?: boolean;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
  border = true,
}) => (
  <div
    className={`px-6 py-4 ${border ? 'border-b border-gray-200' : ''} ${className}`}
  >
    {children}
  </div>
);

/**
 * Card Body Component
 */
export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const CardBody: React.FC<CardBodyProps> = ({
  children,
  className = '',
}) => <div className={`px-6 py-4 ${className}`}>{children}</div>;

/**
 * Card Footer Component
 */
export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
  border?: boolean;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  children,
  className = '',
  border = true,
}) => (
  <div
    className={`px-6 py-4 ${border ? 'border-t border-gray-200' : ''} ${className}`}
  >
    {children}
  </div>
);

/**
 * Card Title Component
 */
export interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className = '',
  as: Component = 'h3',
}) => {
  const titleClasses = {
    h1: 'text-2xl font-bold text-gray-900',
    h2: 'text-xl font-bold text-gray-900',
    h3: 'text-lg font-semibold text-gray-900',
    h4: 'text-base font-semibold text-gray-900',
    h5: 'text-sm font-semibold text-gray-900',
    h6: 'text-xs font-semibold text-gray-900',
  };

  return (
    <Component className={`${titleClasses[Component]} ${className}`}>
      {children}
    </Component>
  );
};

/**
 * Card Description Component
 */
export interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({
  children,
  className = '',
}) => <p className={`text-sm text-gray-600 ${className}`}>{children}</p>;

/**
 * Stats Card Component
 */
export interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  className = '',
}) => (
  <Card className={className} hover>
    <CardBody>
      <div className='flex items-center justify-between'>
        <div className='flex-1'>
          <p className='text-sm font-medium text-gray-600'>{title}</p>
          <p className='text-2xl font-bold text-gray-900 mt-1'>{value}</p>
          {description && (
            <p className='text-sm text-gray-500 mt-1'>{description}</p>
          )}
          {trend && (
            <div className='flex items-center mt-2'>
              <span
                className={`text-sm font-medium ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? '+' : ''}
                {trend.value}%
              </span>
              {trend.label && (
                <span className='text-sm text-gray-500 ml-1'>
                  {trend.label}
                </span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className='flex-shrink-0 ml-4'>
            <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>
              <div className='text-blue-600'>{icon}</div>
            </div>
          </div>
        )}
      </div>
    </CardBody>
  </Card>
);

/**
 * Feature Card Component
 */
export interface FeatureCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  action,
  className = '',
}) => (
  <Card className={className} hover>
    <CardBody>
      {icon && (
        <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4'>
          <div className='text-blue-600'>{icon}</div>
        </div>
      )}
      <CardTitle as='h4' className='mb-2'>
        {title}
      </CardTitle>
      <CardDescription className='mb-4'>{description}</CardDescription>
      {action && (
        <button
          onClick={action.onClick}
          className='text-blue-600 hover:text-blue-700 text-sm font-medium'
        >
          {action.label} →
        </button>
      )}
    </CardBody>
  </Card>
);
