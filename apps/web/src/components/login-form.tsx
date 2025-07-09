import React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface LoginFormProps extends Omit<React.ComponentProps<'form'>, 'onSubmit'> {
  onSubmit: (data: { email: string; password: string }) => void;
  isLoading?: boolean;
  error?: string;
  email?: string;
  password?: string;
  onEmailChange?: (email: string) => void;
  onPasswordChange?: (password: string) => void;
  emailError?: string;
  passwordError?: string;
  showHeader?: boolean;
}

export function LoginForm({
  className,
  onSubmit,
  isLoading = false,
  error,
  email = '',
  password = '',
  onEmailChange,
  onPasswordChange,
  emailError,
  passwordError,
  showHeader = true,
  ...props
}: LoginFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      onSubmit={handleSubmit}
      {...props}
    >
      {showHeader && (
        <div className='flex flex-col items-center gap-2 text-center'>
          <h1 className='text-2xl font-bold'>Login to your account</h1>
          <p className='text-muted-foreground text-sm text-balance'>
            Enter your email below to login to your account
          </p>
        </div>
      )}

      {/* Global error display */}
      {error && (
        <div className='rounded-md bg-red-50 p-4'>
          <div className='text-sm text-red-700'>{error}</div>
        </div>
      )}

      <div className='grid gap-6'>
        <div className='grid gap-3'>
          <Label htmlFor='email'>Email</Label>
          <Input
            id='email'
            type='email'
            placeholder='m@example.com'
            required
            value={email}
            onChange={(e) => onEmailChange?.(e.target.value)}
          />
          {emailError && (
            <p className='text-sm text-red-600'>{emailError}</p>
          )}
        </div>
        <div className='grid gap-3'>
          <div className='flex items-center'>
            <Label htmlFor='password'>Password</Label>
            <a
              href='#'
              className='ml-auto text-sm underline-offset-4 hover:underline'
            >
              Forgot your password?
            </a>
          </div>
          <Input
            id='password'
            type='password'
            required
            value={password}
            onChange={(e) => onPasswordChange?.(e.target.value)}
          />
          {passwordError && (
            <p className='text-sm text-red-600'>{passwordError}</p>
          )}
        </div>
        <Button type='submit' className='w-full' disabled={isLoading}>
          {isLoading ? (
            <span className='flex items-center'>
              <svg
                className='animate-spin -ml-1 mr-3 h-5 w-5'
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
            'Login'
          )}
        </Button>
      </div>
      <div className='text-center text-sm'>
        Don&apos;t have an account?{' '}
        <a href='/auth/register' className='underline underline-offset-4'>
          Sign up
        </a>
      </div>
    </form>
  );
}
