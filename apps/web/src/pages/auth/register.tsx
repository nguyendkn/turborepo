/**
 * Register Page Component
 * Handles user registration with form validation and error handling
 */

import { useNavigate } from '@tanstack/react-router';
import { useStore } from '@tanstack/react-store';
import React, { useEffect } from 'react';

import { useRegister } from '@/hooks/api/use-auth-api';
import { useForm, validationSchemas } from '@/hooks/ui/use-form';
import { authStore, authSelectors } from '@/store';
import type { RegisterRequest } from '@/types';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const isAuthenticated = useStore(authStore, authSelectors.isAuthenticated);
  const authError = useStore(authStore, authSelectors.getError);

  const registerMutation = useRegister();

  const form = useForm<RegisterRequest>({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
    },
    validationSchema: validationSchemas.register,
    onSubmit: async values => {
      await registerMutation.mutateAsync(values);
    },
    onSuccess: () => {
      navigate({ to: '/dashboard' });
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/dashboard' });
    }
  }, [isAuthenticated, navigate]);

  const formState = form.getFormState();

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
            Create your account
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            Fill in your details to get started
          </p>
        </div>

        <form className='mt-8 space-y-6' onSubmit={form.handleSubmit}>
          {/* Global error display */}
          {(authError || registerMutation.error) && (
            <div className='rounded-md bg-red-50 p-4'>
              <div className='text-sm text-red-700'>
                {authError ||
                  registerMutation.error?.message ||
                  'Registration failed. Please try again.'}
              </div>
            </div>
          )}

          <div className='space-y-4'>
            {/* First Name and Last Name */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label
                  htmlFor='firstName'
                  className='block text-sm font-medium text-gray-700'
                >
                  First Name
                </label>
                <input
                  id='firstName'
                  name='firstName'
                  type='text'
                  autoComplete='given-name'
                  required
                  className='mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  placeholder='First name'
                  value={formState.data.firstName}
                  onChange={e =>
                    form.setFieldValue('firstName', e.target.value)
                  }
                />
                {formState.errors.firstName && (
                  <p className='mt-1 text-sm text-red-600'>
                    {formState.errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor='lastName'
                  className='block text-sm font-medium text-gray-700'
                >
                  Last Name
                </label>
                <input
                  id='lastName'
                  name='lastName'
                  type='text'
                  autoComplete='family-name'
                  required
                  className='mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                  placeholder='Last name'
                  value={formState.data.lastName}
                  onChange={e => form.setFieldValue('lastName', e.target.value)}
                />
                {formState.errors.lastName && (
                  <p className='mt-1 text-sm text-red-600'>
                    {formState.errors.lastName}
                  </p>
                )}
              </div>
            </div>

            {/* Email field */}
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700'
              >
                Email Address
              </label>
              <input
                id='email'
                name='email'
                type='email'
                autoComplete='email'
                required
                className='mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                placeholder='Email address'
                value={formState.data.email}
                onChange={e => form.setFieldValue('email', e.target.value)}
              />
              {formState.errors.email && (
                <p className='mt-1 text-sm text-red-600'>
                  {formState.errors.email}
                </p>
              )}
            </div>

            {/* Password field */}
            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700'
              >
                Password
              </label>
              <input
                id='password'
                name='password'
                type='password'
                autoComplete='new-password'
                required
                className='mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                placeholder='Password'
                value={formState.data.password}
                onChange={e => form.setFieldValue('password', e.target.value)}
              />
              {formState.errors.password && (
                <p className='mt-1 text-sm text-red-600'>
                  {formState.errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password field */}
            <div>
              <label
                htmlFor='confirmPassword'
                className='block text-sm font-medium text-gray-700'
              >
                Confirm Password
              </label>
              <input
                id='confirmPassword'
                name='confirmPassword'
                type='password'
                autoComplete='new-password'
                required
                className='mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                placeholder='Confirm password'
                value={formState.data.confirmPassword}
                onChange={e =>
                  form.setFieldValue('confirmPassword', e.target.value)
                }
              />
              {formState.errors.confirmPassword && (
                <p className='mt-1 text-sm text-red-600'>
                  {formState.errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type='submit'
              disabled={formState.isSubmitting || registerMutation.isPending}
              className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {formState.isSubmitting || registerMutation.isPending ? (
                <span className='flex items-center'>
                  <svg
                    className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                    xmlns='http://www.w3.org/2000/svg'
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
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create account'
              )}
            </button>
          </div>

          <div className='text-center'>
            <p className='text-sm text-gray-600'>
              Already have an account?{' '}
              <a
                href='/auth/login'
                className='font-medium text-blue-600 hover:text-blue-500'
              >
                Sign in here
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
