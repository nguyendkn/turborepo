/**
 * Checkbox and Radio Components
 * Reusable form input components for selections
 */

import React from 'react';

/**
 * Checkbox Component
 */
export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  description?: string;
  error?: string;
  indeterminate?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      description,
      error,
      indeterminate = false,
      size = 'md',
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const checkboxId =
      id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    };

    const textSizeClasses = {
      sm: 'text-sm',
      md: 'text-sm',
      lg: 'text-base',
    };

    const checkboxClasses = [
      'rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 focus:ring-offset-0 transition-colors duration-200',
      sizeClasses[size],
      error ? 'border-red-300' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    React.useEffect(() => {
      if (ref && typeof ref === 'object' && ref.current) {
        ref.current.indeterminate = indeterminate;
      }
    }, [indeterminate, ref]);

    return (
      <div className='flex items-start'>
        <div className='flex items-center h-5'>
          <input
            ref={ref}
            id={checkboxId}
            type='checkbox'
            className={checkboxClasses}
            {...props}
          />
        </div>

        {(label || description) && (
          <div className='ml-3'>
            {label && (
              <label
                htmlFor={checkboxId}
                className={`font-medium text-gray-700 ${textSizeClasses[size]}`}
              >
                {label}
              </label>
            )}
            {description && (
              <p
                className={`text-gray-500 ${size === 'lg' ? 'text-sm' : 'text-xs'}`}
              >
                {description}
              </p>
            )}
            {error && <p className='text-red-600 text-xs mt-1'>{error}</p>}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

/**
 * Checkbox Group Component
 */
export interface CheckboxOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface CheckboxGroupProps {
  label?: string;
  description?: string;
  options: CheckboxOption[];
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  label,
  description,
  options,
  value,
  onChange,
  error,
  size = 'md',
  orientation = 'vertical',
  className = '',
}) => {
  const handleChange = (optionValue: string, checked: boolean) => {
    if (checked) {
      onChange([...value, optionValue]);
    } else {
      onChange(value.filter(v => v !== optionValue));
    }
  };

  const containerClasses =
    orientation === 'horizontal' ? 'flex flex-wrap gap-4' : 'space-y-3';

  return (
    <fieldset className={className}>
      {label && (
        <legend className='text-sm font-medium text-gray-700 mb-2'>
          {label}
        </legend>
      )}

      {description && (
        <p className='text-sm text-gray-500 mb-3'>{description}</p>
      )}

      <div className={containerClasses}>
        {options.map(option => (
          <Checkbox
            key={option.value}
            label={option.label}
            description={option.description}
            checked={value.includes(option.value)}
            disabled={option.disabled}
            size={size}
            onChange={e => handleChange(option.value, e.target.checked)}
          />
        ))}
      </div>

      {error && <p className='mt-2 text-sm text-red-600'>{error}</p>}
    </fieldset>
  );
};

/**
 * Radio Component
 */
export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ label, description, size = 'md', className = '', id, ...props }, ref) => {
    const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;

    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    };

    const textSizeClasses = {
      sm: 'text-sm',
      md: 'text-sm',
      lg: 'text-base',
    };

    const radioClasses = [
      'border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 focus:ring-offset-0 transition-colors duration-200',
      sizeClasses[size],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className='flex items-start'>
        <div className='flex items-center h-5'>
          <input
            ref={ref}
            id={radioId}
            type='radio'
            className={radioClasses}
            {...props}
          />
        </div>

        {(label || description) && (
          <div className='ml-3'>
            {label && (
              <label
                htmlFor={radioId}
                className={`font-medium text-gray-700 ${textSizeClasses[size]}`}
              >
                {label}
              </label>
            )}
            {description && (
              <p
                className={`text-gray-500 ${size === 'lg' ? 'text-sm' : 'text-xs'}`}
              >
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Radio.displayName = 'Radio';

/**
 * Radio Group Component
 */
export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  label?: string;
  description?: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  name: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  description,
  options,
  value,
  onChange,
  error,
  size = 'md',
  orientation = 'vertical',
  className = '',
  name,
}) => {
  const containerClasses =
    orientation === 'horizontal' ? 'flex flex-wrap gap-4' : 'space-y-3';

  return (
    <fieldset className={className}>
      {label && (
        <legend className='text-sm font-medium text-gray-700 mb-2'>
          {label}
        </legend>
      )}

      {description && (
        <p className='text-sm text-gray-500 mb-3'>{description}</p>
      )}

      <div className={containerClasses}>
        {options.map(option => (
          <Radio
            key={option.value}
            name={name}
            value={option.value}
            label={option.label}
            description={option.description}
            checked={value === option.value}
            disabled={option.disabled}
            size={size}
            onChange={e => onChange(e.target.value)}
          />
        ))}
      </div>

      {error && <p className='mt-2 text-sm text-red-600'>{error}</p>}
    </fieldset>
  );
};
