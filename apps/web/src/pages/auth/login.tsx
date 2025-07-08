/**
 * Login Page Component
 * Handles user authentication with form validation and error handling
 */

import { useNavigate, useSearch } from '@tanstack/react-router';
import { useStore } from '@tanstack/react-store';
import React, { useEffect } from 'react';

import { useLogin } from '@/hooks/api/use-auth-api';
import { useForm, validationSchemas } from '@/hooks/ui/use-form';
import { authStore, authSelectors } from '@/store';
import type { LoginRequest, RouteSearchParams } from '@/types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const search = useSearch({ from: '/auth/login' });
  const redirectTo = (search as RouteSearchParams)?.redirect || '/dashboard';

  const isAuthenticated = useStore(authStore, authSelectors.isAuthenticated);
  const authError = useStore(authStore, authSelectors.getError);

  const loginMutation = useLogin();

  const form = useForm<LoginRequest>({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validationSchemas.login,
    onSubmit: async values => {
      await loginMutation.mutateAsync(values);
    },
    onSuccess: () => {
      navigate({ to: redirectTo });
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: redirectTo });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  const formState = form.getFormState();

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
            Sign in to your account
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            Enter your credentials to access the application
          </p>
        </div>

        <form className='mt-8 space-y-6' onSubmit={form.handleSubmit}>
          {/* Global error display */}
          {(authError || loginMutation.error) && (
            <div className='rounded-md bg-red-50 p-4'>
              <div className='text-sm text-red-700'>
                {authError ||
                  loginMutation.error?.message ||
                  'Login failed. Please try again.'}
              </div>
            </div>
          )}

          <div className='rounded-md shadow-sm -space-y-px'>
            {/* Email field */}
            <div>
              <label htmlFor='email' className='sr-only'>
                Email address
              </label>
              <input
                id='email'
                name='email'
                type='email'
                autoComplete='email'
                required
                className='appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
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
              <label htmlFor='password' className='sr-only'>
                Password
              </label>
              <input
                id='password'
                name='password'
                type='password'
                autoComplete='current-password'
                required
                className='appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
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
          </div>

          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <input
                id='remember-me'
                name='remember-me'
                type='checkbox'
                className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
              />
              <label
                htmlFor='remember-me'
                className='ml-2 block text-sm text-gray-900'
              >
                Remember me
              </label>
            </div>

            <div className='text-sm'>
              <a
                href='#'
                className='font-medium text-blue-600 hover:text-blue-500'
              >
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type='submit'
              disabled={formState.isSubmitting || loginMutation.isPending}
              className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {formState.isSubmitting || loginMutation.isPending ? (
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
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className='text-center'>
            <p className='text-sm text-gray-600'>
              Don&apos;t have an account?{' '}
              <a
                href='/auth/register'
                className='font-medium text-blue-600 hover:text-blue-500'
              >
                Sign up here
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
