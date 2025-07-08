/**
 * TanStack Query Client Configuration
 * Centralized configuration for React Query
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Default query options
 */
const defaultQueryOptions = {
  queries: {
    // Stale time: 5 minutes
    staleTime: 5 * 60 * 1000,
    // Cache time: 10 minutes
    gcTime: 10 * 60 * 1000,
    // Retry failed requests 3 times
    retry: (failureCount: number, error: Error) => {
      // Type guard to check if error has status property (like ApiError)
      const errorWithStatus = error as unknown as { status?: number };

      // Don't retry on 4xx errors (client errors)
      if (errorWithStatus.status && errorWithStatus.status >= 400 && errorWithStatus.status < 500) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    // Retry delay with exponential backoff
    retryDelay: (attemptIndex: number) =>
      Math.min(1000 * 2 ** attemptIndex, 30000),
    // Refetch on window focus in production
    refetchOnWindowFocus: process.env.NODE_ENV === 'production',
    // Refetch on reconnect
    refetchOnReconnect: true,
    // Background refetch interval: 5 minutes
    refetchInterval: 5 * 60 * 1000,
  },
  mutations: {
    // Retry failed mutations once
    retry: 1,
    // Retry delay: 1 second
    retryDelay: 1000,
  },
};

/**
 * Create and configure Query Client
 */
export const queryClient = new QueryClient({
  defaultOptions: defaultQueryOptions,
});

/**
 * Query key factories for consistent cache keys
 */
export const queryKeys = {
  // Authentication
  auth: {
    all: () => ['auth'] as const,
    user: () => ['auth', 'user'] as const,
    permissions: (userId: string) => ['auth', 'permissions', userId] as const,
  },

  // Users
  users: {
    all: () => ['users'] as const,
    lists: () => ['users', 'list'] as const,
    list: (params: Record<string, unknown>) =>
      ['users', 'list', params] as const,
    details: () => ['users', 'detail'] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
  },

  // Roles
  roles: {
    all: () => ['roles'] as const,
    lists: () => ['roles', 'list'] as const,
    list: (params: Record<string, unknown>) =>
      ['roles', 'list', params] as const,
    details: () => ['roles', 'detail'] as const,
    detail: (id: string) => ['roles', 'detail', id] as const,
    assignments: (roleId: string) => ['roles', 'assignments', roleId] as const,
  },

  // Policies
  policies: {
    all: () => ['policies'] as const,
    lists: () => ['policies', 'list'] as const,
    list: (params: Record<string, unknown>) =>
      ['policies', 'list', params] as const,
    details: () => ['policies', 'detail'] as const,
    detail: (id: string) => ['policies', 'detail', id] as const,
  },

  // Permissions
  permissions: {
    all: () => ['permissions'] as const,
    lists: () => ['permissions', 'list'] as const,
    list: (params: Record<string, unknown>) =>
      ['permissions', 'list', params] as const,
    evaluation: (request: Record<string, unknown>) =>
      ['permissions', 'evaluation', request] as const,
  },

  // Profile
  profile: {
    all: () => ['profile'] as const,
    current: () => ['profile', 'current'] as const,
  },
} as const;

/**
 * Utility functions for cache management
 */
export const cacheUtils = {
  /**
   * Invalidate all queries for a specific entity
   */
  invalidateEntity: (entity: keyof typeof queryKeys) => {
    return queryClient.invalidateQueries({
      queryKey: queryKeys[entity].all(),
    });
  },

  /**
   * Remove all queries for a specific entity
   */
  removeEntity: (entity: keyof typeof queryKeys) => {
    return queryClient.removeQueries({
      queryKey: queryKeys[entity].all(),
    });
  },

  /**
   * Prefetch a query
   */
  prefetch: <T>(
    queryKey: readonly unknown[],
    queryFn: () => Promise<T>,
    options?: { staleTime?: number }
  ) => {
    return queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime: options?.staleTime || 5 * 60 * 1000,
    });
  },

  /**
   * Set query data in cache
   */
  setQueryData: <T>(queryKey: readonly unknown[], data: T) => {
    return queryClient.setQueryData(queryKey, data);
  },

  /**
   * Get query data from cache
   */
  getQueryData: <T>(queryKey: readonly unknown[]): T | undefined => {
    return queryClient.getQueryData<T>(queryKey);
  },

  /**
   * Clear all cache
   */
  clear: () => {
    return queryClient.clear();
  },
};
