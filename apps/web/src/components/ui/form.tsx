/**
 * Form Components
 * Reusable form components that integrate with TanStack Form
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { type FieldApi } from '@tanstack/react-form';
import React from 'react';

import { Button, type ButtonProps } from './button';
import { Card, CardBody } from './card';
import {
  Checkbox,
  Radio,
  CheckboxGroup,
  RadioGroup,
  type CheckboxProps,
  type RadioProps,
  type CheckboxGroupProps,
  type RadioGroupProps,
} from './checkbox';
import {
  Input,
  Textarea,
  Select,
  type InputProps,
  type TextareaProps,
  type SelectProps,
} from './input';

/**
 * Form Container Component
 */
export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  className?: string;
}

export const Form: React.FC<FormProps> = ({
  children,
  className = '',
  ...props
}) => (
  <form className={`space-y-6 ${className}`} {...props}>
    {children}
  </form>
);

/**
 * Form Section Component
 */
export interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  className = '',
}) => (
  <div className={className}>
    {(title || description) && (
      <div className='mb-4'>
        {title && (
          <h3 className='text-lg font-medium text-gray-900 mb-1'>{title}</h3>
        )}
        {description && <p className='text-sm text-gray-600'>{description}</p>}
      </div>
    )}
    <div className='space-y-4'>{children}</div>
  </div>
);

/**
 * Form Field Component
 */
export interface FormFieldProps {
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  children,
  className = '',
}) => <div className={`space-y-1 ${className}`}>{children}</div>;

/**
 * Form Actions Component
 */
export interface FormActionsProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export const FormActions: React.FC<FormActionsProps> = ({
  children,
  className = '',
  align = 'right',
}) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <div className={`flex space-x-3 ${alignClasses[align]} ${className}`}>
      {children}
    </div>
  );
};

/**
 * TanStack Form Field Components
 */

/**
 * Form Input Field
 */
export interface FormInputProps
  extends Omit<InputProps, 'value' | 'onChange' | 'error'> {
  field: FieldApi<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >;
}

export const FormInput: React.FC<FormInputProps> = ({ field, ...props }) => (
  <Input
    value={field.state.value || ''}
    onChange={e => field.handleChange(e.target.value)}
    onBlur={field.handleBlur}
    error={field.state.meta.errors?.[0]}
    {...props}
  />
);

/**
 * Form Textarea Field
 */
export interface FormTextareaProps
  extends Omit<TextareaProps, 'value' | 'onChange' | 'error'> {
  field: FieldApi<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  field,
  ...props
}) => (
  <Textarea
    value={field.state.value || ''}
    onChange={e => field.handleChange(e.target.value)}
    onBlur={field.handleBlur}
    error={field.state.meta.errors?.[0]}
    {...props}
  />
);

/**
 * Form Select Field
 */
export interface FormSelectProps
  extends Omit<SelectProps, 'value' | 'onChange' | 'error'> {
  field: FieldApi<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >;
}

export const FormSelect: React.FC<FormSelectProps> = ({ field, ...props }) => (
  <Select
    value={field.state.value || ''}
    onChange={e => field.handleChange(e.target.value)}
    onBlur={field.handleBlur}
    error={field.state.meta.errors?.[0]}
    {...props}
  />
);

/**
 * Form Checkbox Field
 */
export interface FormCheckboxProps
  extends Omit<CheckboxProps, 'checked' | 'onChange' | 'error'> {
  field: FieldApi<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >;
}

export const FormCheckbox: React.FC<FormCheckboxProps> = ({
  field,
  ...props
}) => (
  <Checkbox
    checked={field.state.value || false}
    onChange={e => field.handleChange(e.target.checked)}
    onBlur={field.handleBlur}
    error={field.state.meta.errors?.[0]}
    {...props}
  />
);

/**
 * Form Radio Field
 */
export interface FormRadioProps
  extends Omit<RadioProps, 'checked' | 'onChange'> {
  field: FieldApi<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >;
  value: string;
}

export const FormRadio: React.FC<FormRadioProps> = ({
  field,
  value,
  ...props
}) => (
  <Radio
    checked={field.state.value === value}
    onChange={() => field.handleChange(value)}
    onBlur={field.handleBlur}
    value={value}
    {...props}
  />
);

/**
 * Form Checkbox Group Field
 */
export interface FormCheckboxGroupProps
  extends Omit<CheckboxGroupProps, 'value' | 'onChange' | 'error'> {
  field: FieldApi<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >;
}

export const FormCheckboxGroup: React.FC<FormCheckboxGroupProps> = ({
  field,
  ...props
}) => (
  <CheckboxGroup
    value={field.state.value || []}
    onChange={value => field.handleChange(value)}
    error={field.state.meta.errors?.[0]}
    {...props}
  />
);

/**
 * Form Radio Group Field
 */
export interface FormRadioGroupProps
  extends Omit<RadioGroupProps, 'value' | 'onChange' | 'error'> {
  field: FieldApi<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >;
}

export const FormRadioGroup: React.FC<FormRadioGroupProps> = ({
  field,
  ...props
}) => (
  <RadioGroup
    value={field.state.value || ''}
    onChange={value => field.handleChange(value)}
    error={field.state.meta.errors?.[0]}
    {...props}
  />
);

/**
 * Form Submit Button
 */
export interface FormSubmitButtonProps
  extends Omit<ButtonProps, 'type' | 'isLoading' | 'form'> {
  form: any; // ReturnType<typeof useTanStackForm> with proper typing
  loadingText?: string;
}

export const FormSubmitButton: React.FC<FormSubmitButtonProps> = ({
  form,
  loadingText = 'Submitting...',
  children,
  ...props
}) => (
  <Button
    type='submit'
    isLoading={form.state.isSubmitting}
    loadingText={loadingText}
    disabled={!form.state.canSubmit || form.state.isSubmitting}
    {...props}
  >
    {children}
  </Button>
);

/**
 * Form Card Component
 */
export interface FormCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormCard: React.FC<FormCardProps> = ({
  title,
  description,
  children,
  className = '',
}) => (
  <Card className={className}>
    <CardBody>
      {(title || description) && (
        <div className='mb-6'>
          {title && (
            <h2 className='text-xl font-semibold text-gray-900 mb-2'>
              {title}
            </h2>
          )}
          {description && (
            <p className='text-sm text-gray-600'>{description}</p>
          )}
        </div>
      )}
      {children}
    </CardBody>
  </Card>
);

/**
 * Form Error Summary Component
 */
export interface FormErrorSummaryProps {
  form: any; // ReturnType<typeof useTanStackForm> with proper typing
  className?: string;
}

export const FormErrorSummary: React.FC<FormErrorSummaryProps> = ({
  form,
  className = '',
}) => {
  const errors = form.state.errors;

  if (!errors || errors.length === 0) {
    return null;
  }

  return (
    <div
      className={`bg-red-50 border border-red-200 rounded-md p-4 ${className}`}
    >
      <div className='flex'>
        <div className='flex-shrink-0'>
          <svg
            className='h-5 w-5 text-red-400'
            fill='currentColor'
            viewBox='0 0 20 20'
          >
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
              clipRule='evenodd'
            />
          </svg>
        </div>
        <div className='ml-3'>
          <h3 className='text-sm font-medium text-red-800'>
            Please correct the following errors:
          </h3>
          <div className='mt-2 text-sm text-red-700'>
            <ul className='list-disc pl-5 space-y-1'>
              {errors.map((error: string, index: number) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
