/**
 * Users API Hooks
 * Custom hooks for user management API operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import { queryKeys, cacheUtils } from '@/lib/query-client';
import { appActions } from '@/store';
import type {
  User,
  UserQueryParams,
  CreateUserRequest,
  UpdateUserRequest,
  UserListResponse,
  ApiErrorType,
} from '@/types';

/**
 * Users list query hook
 */
export const useUsers = (params: UserQueryParams = {}) => {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: async (): Promise<UserListResponse> => {
      const response = await apiClient.get<UserListResponse>('/users', {
        params,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch users');
      }

      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    placeholderData: previousData => previousData,
  });
};

/**
 * Single user query hook
 */
export const useUser = (
  userId: string,
  options: { enabled?: boolean } = {}
) => {
  return useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: async () => {
      const response = await apiClient.get(`/users/${userId}`);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch user');
      }

      return response;
    },
    enabled: !!userId && options.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Create user mutation hook
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: CreateUserRequest): Promise<User> => {
      const response = await apiClient.post<User>('/users', userData);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to create user');
      }

      return response.data;
    },
    onSuccess: newUser => {
      // Invalidate users list queries
      cacheUtils.invalidateEntity('users');

      // Add new user to cache
      queryClient.setQueryData(queryKeys.users.detail(newUser.id), newUser);

      // Show success notification
      appActions.addNotification({
        type: 'success',
        title: 'User Created',
        message: `User ${newUser.firstName} ${newUser.lastName} has been created successfully.`,
      });
    },
    onError: (error: ApiErrorType) => {
      appActions.addNotification({
        type: 'error',
        title: 'Create User Failed',
        message: error.message || 'Failed to create user',
      });
    },
  });
};

/**
 * Update user mutation hook
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateUserRequest;
    }): Promise<User> => {
      const response = await apiClient.put<User>(`/users/${id}`, data);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to update user');
      }

      return response.data;
    },
    onSuccess: updatedUser => {
      // Update user in cache
      queryClient.setQueryData(
        queryKeys.users.detail(updatedUser.id),
        updatedUser
      );

      // Invalidate users list queries
      cacheUtils.invalidateEntity('users');

      // Show success notification
      appActions.addNotification({
        type: 'success',
        title: 'User Updated',
        message: `User ${updatedUser.firstName} ${updatedUser.lastName} has been updated successfully.`,
      });
    },
    onError: (error: ApiErrorType) => {
      appActions.addNotification({
        type: 'error',
        title: 'Update User Failed',
        message: error.message || 'Failed to update user',
      });
    },
  });
};

/**
 * Delete user mutation hook
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string): Promise<void> => {
      const response = await apiClient.delete(`/users/${userId}`);

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to delete user');
      }
    },
    onSuccess: (_, userId) => {
      // Remove user from cache
      queryClient.removeQueries({
        queryKey: queryKeys.users.detail(userId),
      });

      // Invalidate users list queries
      cacheUtils.invalidateEntity('users');

      // Show success notification
      appActions.addNotification({
        type: 'success',
        title: 'User Deleted',
        message: 'User has been deleted successfully.',
      });
    },
    onError: (error: ApiErrorType) => {
      appActions.addNotification({
        type: 'error',
        title: 'Delete User Failed',
        message: error.message || 'Failed to delete user',
      });
    },
  });
};

/**
 * Activate/Deactivate user mutation hook
 */
export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      isActive,
    }: {
      userId: string;
      isActive: boolean;
    }): Promise<User> => {
      const response = await apiClient.put<User>(`/users/${userId}`, {
        isActive,
      });

      if (!response.success || !response.data) {
        throw new Error(
          response.error?.message || 'Failed to update user status'
        );
      }

      return response.data;
    },
    onSuccess: updatedUser => {
      // Update user in cache
      queryClient.setQueryData(
        queryKeys.users.detail(updatedUser.id),
        updatedUser
      );

      // Invalidate users list queries
      cacheUtils.invalidateEntity('users');

      // Show success notification
      appActions.addNotification({
        type: 'success',
        title: 'User Status Updated',
        message: `User has been ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully.`,
      });
    },
    onError: (error: ApiErrorType) => {
      appActions.addNotification({
        type: 'error',
        title: 'Update Status Failed',
        message: error.message || 'Failed to update user status',
      });
    },
  });
};

/**
 * Bulk operations hook
 */
export const useBulkUserOperations = () => {
  const queryClient = useQueryClient();

  const bulkDelete = useMutation({
    mutationFn: async (userIds: string[]): Promise<void> => {
      const response = await apiClient.post('/users/bulk-delete', { userIds });

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to delete users');
      }
    },
    onSuccess: (_, userIds) => {
      // Remove users from cache
      userIds.forEach(userId => {
        queryClient.removeQueries({
          queryKey: queryKeys.users.detail(userId),
        });
      });

      // Invalidate users list queries
      cacheUtils.invalidateEntity('users');

      appActions.addNotification({
        type: 'success',
        title: 'Users Deleted',
        message: `${userIds.length} users have been deleted successfully.`,
      });
    },
    onError: (error: ApiErrorType) => {
      appActions.addNotification({
        type: 'error',
        title: 'Bulk Delete Failed',
        message: error.message || 'Failed to delete users',
      });
    },
  });

  const bulkActivate = useMutation({
    mutationFn: async (userIds: string[]): Promise<void> => {
      const response = await apiClient.post('/users/bulk-activate', {
        userIds,
      });

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to activate users');
      }
    },
    onSuccess: (_, userIds) => {
      // Invalidate affected user caches
      userIds.forEach(userId => {
        queryClient.invalidateQueries({
          queryKey: queryKeys.users.detail(userId),
        });
      });

      // Invalidate users list queries
      cacheUtils.invalidateEntity('users');

      appActions.addNotification({
        type: 'success',
        title: 'Users Activated',
        message: `${userIds.length} users have been activated successfully.`,
      });
    },
    onError: (error: ApiErrorType) => {
      appActions.addNotification({
        type: 'error',
        title: 'Bulk Activate Failed',
        message: error.message || 'Failed to activate users',
      });
    },
  });

  return {
    bulkDelete,
    bulkActivate,
  };
};
