/**
 * Form Management Hook
 * Custom hook for form handling using TanStack Form
 */

import { useForm as useTanStackForm } from '@tanstack/react-form';
import { z } from 'zod';

import type { FormState, ApiErrorType } from '@/types';

// Validation schemas
export const validationSchemas = {
  login: z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
  }),

  register: z
    .object({
      email: z.string().email('Please enter a valid email address'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
      confirmPassword: z.string().min(1, 'Please confirm your password'),
      firstName: z.string().min(1, 'First name is required'),
      lastName: z.string().min(1, 'Last name is required'),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    }),

  user: z.object({
    email: z.string().email('Please enter a valid email address'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    isActive: z.boolean().optional(),
  }),

  role: z.object({
    name: z.string().min(1, 'Role name is required'),
    description: z.string().optional(),
    priority: z.number().min(0, 'Priority must be a positive number'),
    isActive: z.boolean().optional(),
  }),

  policy: z.object({
    name: z.string().min(1, 'Policy name is required'),
    description: z.string().optional(),
    effect: z.enum(['allow', 'deny']),
    actions: z.array(z.string()).min(1, 'At least one action is required'),
    resources: z.array(z.string()).min(1, 'At least one resource is required'),
    priority: z.number().min(0, 'Priority must be a positive number'),
    isActive: z.boolean().optional(),
    conditions: z
      .object({
        user: z
          .object({
            attributes: z.record(z.unknown()).optional(),
          })
          .optional(),
        resource: z
          .object({
            attributes: z.record(z.unknown()).optional(),
          })
          .optional(),
        environment: z
          .object({
            timeRange: z
              .object({
                start: z.string().optional(),
                end: z.string().optional(),
              })
              .optional(),
            ipWhitelist: z.array(z.string()).optional(),
            ipBlacklist: z.array(z.string()).optional(),
            location: z.array(z.string()).optional(),
          })
          .optional(),
        custom: z.record(z.unknown()).optional(),
      })
      .optional(),
  }),
  userCreate: z
    .object({
      firstName: z.string().min(1, 'First name is required'),
      lastName: z.string().min(1, 'Last name is required'),
      email: z.string().email('Please enter a valid email address'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
      confirmPassword: z.string().min(1, 'Please confirm your password'),
      roleIds: z.array(z.string()).optional(),
      isActive: z.boolean().default(true),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    }),
  userEdit: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Please enter a valid email address'),
    roleIds: z.array(z.string()).optional(),
    isActive: z.boolean().default(true),
  }),
  roleForm: z.object({
    name: z.string().min(1, 'Role name is required'),
    description: z.string().optional(),
    policyIds: z.array(z.string()).default([]),
    isSystemRole: z.boolean().default(false),
    metadata: z.record(z.any()).optional(),
  }),
};

/**
 * Form configuration options
 */
interface UseFormOptions<T> {
  initialValues: T;
  validationSchema?: z.ZodSchema<T>;
  onSubmit: (values: T) => Promise<void> | void;
  onSuccess?: (values: T) => void;
  onError?: (error: ApiErrorType) => void;
  resetOnSuccess?: boolean;
}

/**
 * Enhanced form hook with validation and error handling
 */
export const useForm = <T extends object = Record<string, unknown>>({
  initialValues,
  validationSchema,
  onSubmit,
  onSuccess,
  onError,
  resetOnSuccess = false,
}: UseFormOptions<T>) => {
  const form = useTanStackForm({
    defaultValues: initialValues,
    validators: validationSchema
      ? {
          onChange: validationSchema,
        }
      : undefined,
    onSubmit: async ({ value }) => {
      try {
        await onSubmit(value);
        onSuccess?.(value);
        if (resetOnSuccess) {
          form.reset();
        }
      } catch (error) {
        onError?.(error as ApiErrorType);
        throw error;
      }
    },
  });

  /**
   * Get form state summary
   */
  const getFormState = (): FormState<T> => ({
    data: form.state.values,
    errors: {} as Record<string, string>, // Simplified for now
    isSubmitting: form.state.isSubmitting,
    isValid: form.state.isValid,
    isDirty: form.state.isDirty,
  });

  /**
   * Reset form to initial values
   */
  const reset = () => {
    form.reset();
  };

  /**
   * Set form values
   */
  const setValues = (values: Partial<T>) => {
    Object.entries(values).forEach(([key, value]) => {
      const field = form.getFieldInfo(key);
      if (field) {
        form.setFieldValue(key, value as never);
      }
    });
  };

  /**
   * Set field error
   */
  const setFieldError = (fieldName: string, error: string) => {
    form.setFieldMeta(fieldName, prev => ({
      ...prev,
      errors: [error],
    }));
  };

  /**
   * Clear field error
   */
  const clearFieldError = (fieldName: string) => {
    form.setFieldMeta(fieldName, prev => ({
      ...prev,
      errors: [],
    }));
  };

  /**
   * Validate specific field
   */
  const validateField = async (fieldName: string) => {
    const field = form.getFieldInfo(fieldName);
    if (field) {
      await form.validateField(fieldName, 'change');
    }
  };

  /**
   * Validate entire form
   */
  const validateForm = async () => {
    await form.validateAllFields('change');
    return form.state.isValid;
  };

  return {
    form,
    formState: getFormState(),
    getFormState,
    reset,
    setValues,
    setFieldError,
    clearFieldError,
    validateField,
    validateForm,
    // Expose commonly used form methods
    handleSubmit: form.handleSubmit,
    Subscribe: form.Subscribe,
    getFieldInfo: form.getFieldInfo,
    setFieldValue: form.setFieldValue,
  };
};

/**
 * Form field helper hook
 */
export const useFormField = (
  form: {
    useField: (config: {
      name: string;
      validators?: Record<string, unknown>;
    }) => {
      state: {
        meta: { errors?: string[]; isDirty: boolean; isTouched: boolean };
      };
    };
  },
  name: string,
  options?: {
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
  }
) => {
  const field = form.useField({
    name,
    validators: options?.validateOnChange
      ? {
          onChange: () => {
            // Custom validation logic can be added here
            return undefined;
          },
        }
      : undefined,
  });

  return {
    field,
    error: field.state.meta.errors?.[0],
    hasError: field.state.meta.errors && field.state.meta.errors.length > 0,
    isDirty: field.state.meta.isDirty,
    isTouched: field.state.meta.isTouched,
  };
};
