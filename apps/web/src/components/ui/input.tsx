/**
 * Input Components
 * Reusable input components with validation and error states
 */

import React from 'react';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  variant?: 'default' | 'filled' | 'outlined';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      variant = 'default',
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const baseInputClasses =
      'block px-3 py-2 text-sm placeholder-gray-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0';

    const variantClasses = {
      default:
        'border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500',
      filled:
        'border-0 bg-gray-100 rounded-md focus:ring-blue-500 focus:bg-white',
      outlined:
        'border-2 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500',
    };

    const errorClasses = error
      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
      : '';

    const inputClasses = [
      baseInputClasses,
      variantClasses[variant],
      errorClasses,
      leftIcon ? 'pl-10' : '',
      rightIcon ? 'pr-10' : '',
      fullWidth ? 'w-full' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label
            htmlFor={inputId}
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            {label}
          </label>
        )}

        <div className='relative'>
          {leftIcon && (
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <span className='text-gray-400'>{leftIcon}</span>
            </div>
          )}

          <input ref={ref} id={inputId} className={inputClasses} {...props} />

          {rightIcon && (
            <div className='absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none'>
              <span className='text-gray-400'>{rightIcon}</span>
            </div>
          )}
        </div>

        {error && <p className='mt-1 text-sm text-red-600'>{error}</p>}

        {helperText && !error && (
          <p className='mt-1 text-sm text-gray-500'>{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

/**
 * Textarea Component
 */
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  variant?: 'default' | 'filled' | 'outlined';
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      variant = 'default',
      resize = 'vertical',
      className = '',
      id,
      rows = 3,
      ...props
    },
    ref
  ) => {
    const textareaId =
      id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    const baseClasses =
      'block px-3 py-2 text-sm placeholder-gray-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0';

    const variantClasses = {
      default:
        'border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500',
      filled:
        'border-0 bg-gray-100 rounded-md focus:ring-blue-500 focus:bg-white',
      outlined:
        'border-2 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500',
    };

    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    };

    const errorClasses = error
      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
      : '';

    const textareaClasses = [
      baseClasses,
      variantClasses[variant],
      resizeClasses[resize],
      errorClasses,
      fullWidth ? 'w-full' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label
            htmlFor={textareaId}
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={textareaClasses}
          {...props}
        />

        {error && <p className='mt-1 text-sm text-red-600'>{error}</p>}

        {helperText && !error && (
          <p className='mt-1 text-sm text-gray-500'>{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

/**
 * Select Component
 */
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
  variant?: 'default' | 'filled' | 'outlined';
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder,
      fullWidth = false,
      variant = 'default',
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    const baseClasses =
      'block px-3 py-2 text-sm bg-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0';

    const variantClasses = {
      default:
        'border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500',
      filled: 'border-0 bg-gray-100 rounded-md focus:ring-blue-500',
      outlined:
        'border-2 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500',
    };

    const errorClasses = error
      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
      : '';

    const selectClasses = [
      baseClasses,
      variantClasses[variant],
      errorClasses,
      fullWidth ? 'w-full' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label
            htmlFor={selectId}
            className='block text-sm font-medium text-gray-700 mb-1'
          >
            {label}
          </label>
        )}

        <select ref={ref} id={selectId} className={selectClasses} {...props}>
          {placeholder && (
            <option value='' disabled>
              {placeholder}
            </option>
          )}
          {options.map(option => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        {error && <p className='mt-1 text-sm text-red-600'>{error}</p>}

        {helperText && !error && (
          <p className='mt-1 text-sm text-gray-500'>{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
