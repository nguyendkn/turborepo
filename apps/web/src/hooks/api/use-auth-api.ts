/**
 * Authentication API Hooks
 * Custom hooks for authentication-related API operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useErrorHandler, useNotifications } from '@/hooks/ui';
import { apiClient } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-client';
import { authActions } from '@/store';
import type {
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthResponse,
  User,
  ApiErrorType,
} from '@/types';

/**
 * Login mutation hook
 */
export const useLogin = () => {
  const queryClient = useQueryClient();
  const { handleApiError } = useErrorHandler();
  const { success } = useNotifications();

  return useMutation({
    mutationFn: async (credentials: LoginRequest): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>(
        '/auth/login',
        credentials
      );

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Login failed');
      }

      return response.data;
    },
    onSuccess: data => {
      // Update authentication store
      authActions.setAuthenticated(
        data.user,
        data.accessToken,
        data.refreshToken
      );

      // Set user data in cache
      queryClient.setQueryData(queryKeys.auth.user(), data.user);

      // Prefetch user permissions
      queryClient.prefetchQuery({
        queryKey: queryKeys.auth.permissions(data.user.id),
        queryFn: () => fetchUserPermissions(data.user.id),
      });

      // Show success notification
      success(`Welcome back, ${data.user.firstName}!`, 'Login Successful');
    },
    onError: (error: ApiErrorType) => {
      authActions.setError(error.message || 'Login failed');
      handleApiError(error, {
        context: 'Login',
        showNotification: true,
      });
    },
  });
};

/**
 * Register mutation hook
 */
export const useRegister = () => {
  const { handleApiError } = useErrorHandler();
  const { success } = useNotifications();

  return useMutation({
    mutationFn: async (userData: RegisterRequest): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>(
        '/auth/register',
        userData
      );

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Registration failed');
      }

      return response.data;
    },
    onSuccess: data => {
      // Update authentication store
      authActions.setAuthenticated(
        data.user,
        data.accessToken,
        data.refreshToken
      );

      // Show success notification
      success(
        `Welcome, ${data.user.firstName}! Your account has been created.`,
        'Registration Successful'
      );
    },
    onError: (error: ApiErrorType) => {
      authActions.setError(error.message || 'Registration failed');
      handleApiError(error, {
        context: 'Registration',
        showNotification: true,
      });
    },
  });
};

/**
 * Logout mutation hook
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<void> => {
      try {
        await apiClient.post('/auth/logout');
      } catch {
        // Continue with logout even if API call fails
        // Logout API call failed, but continue with logout
      }
    },
    onSuccess: () => {
      // Clear authentication store
      authActions.logout();

      // Clear all cached data
      queryClient.clear();
    },
    onError: () => {
      // Force logout even on error
      authActions.logout();
      queryClient.clear();
    },
  });
};

/**
 * Refresh token mutation hook
 */
export const useRefreshToken = () => {
  return useMutation({
    mutationFn: async (request: RefreshTokenRequest): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>(
        '/auth/refresh',
        request
      );

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Token refresh failed');
      }

      return response.data;
    },
    onSuccess: data => {
      // Update tokens in store
      authActions.setAuthenticated(
        data.user,
        data.accessToken,
        data.refreshToken
      );
    },
    onError: () => {
      // Force logout on refresh failure
      authActions.logout();
    },
  });
};

/**
 * Forgot password mutation hook
 */
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (request: ForgotPasswordRequest): Promise<void> => {
      const response = await apiClient.post('/auth/forgot-password', request);

      if (!response.success) {
        throw new Error(
          response.error?.message || 'Failed to send reset email'
        );
      }
    },
  });
};

/**
 * Reset password mutation hook
 */
export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (request: ResetPasswordRequest): Promise<void> => {
      const response = await apiClient.post('/auth/reset-password', request);

      if (!response.success) {
        throw new Error(response.error?.message || 'Password reset failed');
      }
    },
  });
};

/**
 * Current user query hook
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: async (): Promise<User> => {
      const response = await apiClient.get<User>('/profile');

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch user');
      }

      return response.data;
    },
    enabled: apiClient.isAuthenticated(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: ApiErrorType) => {
      // Don't retry on 401 errors
      if ('status' in error && error.status === 401) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

/**
 * User permissions query hook
 */
export const useUserPermissions = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.auth.permissions(userId),
    queryFn: () => fetchUserPermissions(userId),
    enabled: !!userId && apiClient.isAuthenticated(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Helper function to fetch user permissions
 */
const fetchUserPermissions = async (userId: string) => {
  const response = await apiClient.get(`/users/${userId}/permissions`);

  if (!response.success || !response.data) {
    throw new Error(response.error?.message || 'Failed to fetch permissions');
  }

  return response.data;
};

/**
 * Check authentication status hook
 */
export const useAuthStatus = () => {
  return useQuery({
    queryKey: ['auth', 'status'],
    queryFn: async (): Promise<boolean> => {
      try {
        const response = await apiClient.get('/auth/status');
        return response.success;
      } catch {
        return false;
      }
    },
    enabled: apiClient.isAuthenticated(),
    refetchInterval: 5 * 60 * 1000, // Check every 5 minutes
    retry: false,
  });
};
