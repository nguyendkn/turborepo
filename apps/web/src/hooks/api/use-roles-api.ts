/**
 * Roles API Hooks
 * Custom hooks for role management API operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import { queryKeys, cacheUtils } from '@/lib/query-client';
import { appActions } from '@/store';
import type {
  Role,
  RoleQueryParams,
  CreateRoleRequest,
  UpdateRoleRequest,
  AssignRoleRequest,
  RoleListResponse,
  ApiErrorType,
} from '@/types';

/**
 * Roles list query hook
 */
export const useRoles = (params: RoleQueryParams = {}) => {
  return useQuery({
    queryKey: queryKeys.roles.list(params),
    queryFn: async (): Promise<RoleListResponse> => {
      const response = await apiClient.get<RoleListResponse>('/roles', {
        params,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch roles');
      }

      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: previousData => previousData,
  });
};

/**
 * Single role query hook
 */
export const useRole = (roleId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: queryKeys.roles.detail(roleId),
    queryFn: async (): Promise<Role> => {
      const response = await apiClient.get<Role>(`/roles/${roleId}`);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch role');
      }

      return response.data;
    },
    enabled: options?.enabled !== undefined ? options.enabled : !!roleId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Create role mutation hook
 */
export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleData: CreateRoleRequest): Promise<Role> => {
      const response = await apiClient.post<Role>('/roles', roleData);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to create role');
      }

      return response.data;
    },
    onSuccess: newRole => {
      // Invalidate roles list queries
      cacheUtils.invalidateEntity('roles');

      // Add new role to cache
      queryClient.setQueryData(queryKeys.roles.detail(newRole.id), newRole);

      // Show success notification
      appActions.addNotification({
        type: 'success',
        title: 'Role Created',
        message: `Role "${newRole.name}" has been created successfully.`,
      });
    },
    onError: (error: ApiErrorType) => {
      appActions.addNotification({
        type: 'error',
        title: 'Create Role Failed',
        message: error.message || 'Failed to create role',
      });
    },
  });
};

/**
 * Update role mutation hook
 */
export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roleId,
      updates,
    }: {
      roleId: string;
      updates: UpdateRoleRequest;
    }): Promise<Role> => {
      const response = await apiClient.put<Role>(`/roles/${roleId}`, updates);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to update role');
      }

      return response.data;
    },
    onSuccess: updatedRole => {
      // Update role in cache
      queryClient.setQueryData(
        queryKeys.roles.detail(updatedRole.id),
        updatedRole
      );

      // Invalidate roles list queries
      cacheUtils.invalidateEntity('roles');

      // Show success notification
      appActions.addNotification({
        type: 'success',
        title: 'Role Updated',
        message: `Role "${updatedRole.name}" has been updated successfully.`,
      });
    },
    onError: (error: ApiErrorType) => {
      appActions.addNotification({
        type: 'error',
        title: 'Update Role Failed',
        message: error.message || 'Failed to update role',
      });
    },
  });
};

/**
 * Delete role mutation hook
 */
export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleId: string): Promise<void> => {
      const response = await apiClient.delete(`/roles/${roleId}`);

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to delete role');
      }
    },
    onSuccess: (_, roleId) => {
      // Remove role from cache
      queryClient.removeQueries({
        queryKey: queryKeys.roles.detail(roleId),
      });

      // Invalidate roles list queries
      cacheUtils.invalidateEntity('roles');

      // Show success notification
      appActions.addNotification({
        type: 'success',
        title: 'Role Deleted',
        message: 'Role has been deleted successfully.',
      });
    },
    onError: (error: ApiErrorType) => {
      appActions.addNotification({
        type: 'error',
        title: 'Delete Role Failed',
        message: error.message || 'Failed to delete role',
      });
    },
  });
};

/**
 * Toggle role status mutation hook
 */
export const useToggleRoleStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roleId,
      isActive,
    }: {
      roleId: string;
      isActive: boolean;
    }): Promise<Role> => {
      const response = await apiClient.put<Role>(`/roles/${roleId}`, {
        isActive,
      });

      if (!response.success || !response.data) {
        throw new Error(
          response.error?.message || 'Failed to toggle role status'
        );
      }

      return response.data;
    },
    onSuccess: updatedRole => {
      // Update role in cache
      queryClient.setQueryData(
        queryKeys.roles.detail(updatedRole.id),
        updatedRole
      );

      // Invalidate roles list queries
      cacheUtils.invalidateEntity('roles');

      // Show success notification
      appActions.addNotification({
        type: 'success',
        title: 'Role Status Updated',
        message: `Role "${updatedRole.name}" has been ${updatedRole.isActive ? 'activated' : 'deactivated'}.`,
      });
    },
    onError: (error: ApiErrorType) => {
      appActions.addNotification({
        type: 'error',
        title: 'Toggle Role Status Failed',
        message: error.message || 'Failed to toggle role status',
      });
    },
  });
};

/**
 * Assign role to user mutation hook
 */
export const useAssignRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roleId,
      assignmentData,
    }: {
      roleId: string;
      assignmentData: AssignRoleRequest;
    }): Promise<void> => {
      const response = await apiClient.post(
        `/roles/${roleId}/assign`,
        assignmentData
      );

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to assign role');
      }
    },
    onSuccess: (_, { roleId, assignmentData }) => {
      // Invalidate role assignments
      queryClient.invalidateQueries({
        queryKey: queryKeys.roles.assignments(roleId),
      });

      // Invalidate user data
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(assignmentData.userId),
      });

      // Show success notification
      appActions.addNotification({
        type: 'success',
        title: 'Role Assigned',
        message: 'Role has been assigned successfully.',
      });
    },
    onError: (error: ApiErrorType) => {
      appActions.addNotification({
        type: 'error',
        title: 'Assign Role Failed',
        message: error.message || 'Failed to assign role',
      });
    },
  });
};

/**
 * Unassign role from user mutation hook
 */
export const useUnassignRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roleId,
      userId,
    }: {
      roleId: string;
      userId: string;
    }): Promise<void> => {
      const response = await apiClient.delete(
        `/roles/${roleId}/assign/${userId}`
      );

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to unassign role');
      }
    },
    onSuccess: (_, { roleId, userId }) => {
      // Invalidate role assignments
      queryClient.invalidateQueries({
        queryKey: queryKeys.roles.assignments(roleId),
      });

      // Invalidate user data
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.detail(userId),
      });

      // Show success notification
      appActions.addNotification({
        type: 'success',
        title: 'Role Unassigned',
        message: 'Role has been unassigned successfully.',
      });
    },
    onError: (error: ApiErrorType) => {
      appActions.addNotification({
        type: 'error',
        title: 'Unassign Role Failed',
        message: error.message || 'Failed to unassign role',
      });
    },
  });
};

/**
 * Role assignments query hook
 */
export const useRoleAssignments = (roleId: string) => {
  return useQuery({
    queryKey: queryKeys.roles.assignments(roleId),
    queryFn: async () => {
      const response = await apiClient.get(`/roles/${roleId}/assignments`);

      if (!response.success || !response.data) {
        throw new Error(
          response.error?.message || 'Failed to fetch role assignments'
        );
      }

      return response.data;
    },
    enabled: !!roleId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
