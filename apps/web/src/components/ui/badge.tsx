/**
 * Badge Component
 * Reusable badge component for status indicators and labels
 */

import React from 'react';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info';

export type BadgeSize = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-800',
  primary: 'bg-blue-100 text-blue-800',
  secondary: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  danger: 'bg-red-100 text-red-800',
  warning: 'bg-yellow-100 text-yellow-800',
  info: 'bg-cyan-100 text-cyan-800',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm',
  lg: 'px-3 py-1 text-sm',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false,
}) => {
  const classes = [
    'inline-flex items-center font-medium rounded-full',
    variantClasses[variant],
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes}>
      {dot && <span className='w-1.5 h-1.5 bg-current rounded-full mr-1.5' />}
      {children}
    </span>
  );
};

/**
 * Status Badge Component
 */
export interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'approved' | 'rejected' | 'draft';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
}) => {
  const statusConfig = {
    active: { variant: 'success' as const, label: 'Active', dot: true },
    inactive: { variant: 'secondary' as const, label: 'Inactive', dot: true },
    pending: { variant: 'warning' as const, label: 'Pending', dot: true },
    approved: { variant: 'success' as const, label: 'Approved', dot: false },
    rejected: { variant: 'danger' as const, label: 'Rejected', dot: false },
    draft: { variant: 'secondary' as const, label: 'Draft', dot: false },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} dot={config.dot} className={className}>
      {config.label}
    </Badge>
  );
};

/**
 * Priority Badge Component
 */
export interface PriorityBadgeProps {
  priority: 'low' | 'medium' | 'high' | 'critical';
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  className = '',
}) => {
  const priorityConfig = {
    low: { variant: 'info' as const, label: 'Low' },
    medium: { variant: 'warning' as const, label: 'Medium' },
    high: { variant: 'danger' as const, label: 'High' },
    critical: { variant: 'danger' as const, label: 'Critical' },
  };

  const config = priorityConfig[priority];

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
};

/**
 * Count Badge Component
 */
export interface CountBadgeProps {
  count: number;
  max?: number;
  showZero?: boolean;
  className?: string;
}

export const CountBadge: React.FC<CountBadgeProps> = ({
  count,
  max = 99,
  showZero = false,
  className = '',
}) => {
  if (count === 0 && !showZero) {
    return null;
  }

  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <Badge variant='danger' size='sm' className={className}>
      {displayCount}
    </Badge>
  );
};

/**
 * Role Badge Component
 */
export interface RoleBadgeProps {
  role: string;
  isSystemRole?: boolean;
  className?: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  isSystemRole = false,
  className = '',
}) => (
  <Badge
    variant={isSystemRole ? 'primary' : 'secondary'}
    size='sm'
    className={className}
  >
    {role}
  </Badge>
);

/**
 * Permission Badge Component
 */
export interface PermissionBadgeProps {
  permission: string;
  effect?: 'allow' | 'deny';
  className?: string;
}

export const PermissionBadge: React.FC<PermissionBadgeProps> = ({
  permission,
  effect = 'allow',
  className = '',
}) => (
  <Badge
    variant={effect === 'allow' ? 'success' : 'danger'}
    size='sm'
    className={className}
  >
    {effect === 'deny' && '!'}
    {permission}
  </Badge>
);

/**
 * Tag Badge Component
 */
export interface TagBadgeProps {
  tag: string;
  onRemove?: () => void;
  className?: string;
}

export const TagBadge: React.FC<TagBadgeProps> = ({
  tag,
  onRemove,
  className = '',
}) => (
  <Badge
    variant='secondary'
    className={`${className} ${onRemove ? 'pr-1' : ''}`}
  >
    {tag}
    {onRemove && (
      <button
        onClick={onRemove}
        className='ml-1 text-gray-400 hover:text-gray-600 focus:outline-none'
        aria-label={`Remove ${tag}`}
      >
        <svg
          className='w-3 h-3'
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
      </button>
    )}
  </Badge>
);

/**
 * Badge Group Component
 */
export interface BadgeGroupProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg';
  wrap?: boolean;
}

export const BadgeGroup: React.FC<BadgeGroupProps> = ({
  children,
  className = '',
  spacing = 'sm',
  wrap = true,
}) => {
  const spacingClasses = {
    sm: 'gap-1',
    md: 'gap-2',
    lg: 'gap-3',
  };

  const classes = [
    'flex items-center',
    spacingClasses[spacing],
    wrap ? 'flex-wrap' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={classes}>{children}</div>;
};
