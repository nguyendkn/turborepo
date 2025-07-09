/**
 * Login Page Component
 * Handles user authentication with form validation and error handling
 */

import { useNavigate, useSearch } from '@tanstack/react-router';
import { useStore } from '@tanstack/react-store';
import { GalleryVerticalEnd } from 'lucide-react';
import React, { useEffect } from 'react';

import { LoginForm } from '@/components/login-form';
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

  const handleFormSubmit = async (data: { email: string; password: string }) => {
    form.setFieldValue('email', data.email);
    form.setFieldValue('password', data.password);
    await form.handleSubmit();
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: redirectTo });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  const formState = form.getFormState();

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            CSmart
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm
              onSubmit={handleFormSubmit}
              isLoading={formState.isSubmitting || loginMutation.isPending}
              error={
                authError ||
                loginMutation.error?.message ||
                (loginMutation.error ? 'Login failed. Please try again.' : undefined)
              }
              email={formState.data.email}
              password={formState.data.password}
              onEmailChange={(email) => form.setFieldValue('email', email)}
              onPasswordChange={(password) => form.setFieldValue('password', password)}
              emailError={formState.errors.email}
              passwordError={formState.errors.password}
              showHeader={false}
            />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src="/placeholder.svg"
          alt="Login background"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
};

export default LoginPage;
