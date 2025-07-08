/**
 * Policies API Hooks
 * Custom hooks for policy management API operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import { queryKeys, cacheUtils } from '@/lib/query-client';
import { appActions } from '@/store';
import type {
  Policy,
  PolicyQueryParams,
  CreatePolicyRequest,
  UpdatePolicyRequest,
  TogglePolicyStatusRequest,
  PolicyListResponse,
  PolicyEvaluationRequest,
  PolicyEvaluationResult,
  ApiErrorType,
} from '@/types';

/**
 * Policies list query hook
 */
export const usePolicies = (params: PolicyQueryParams = {}) => {
  return useQuery({
    queryKey: queryKeys.policies.list(params),
    queryFn: async (): Promise<PolicyListResponse> => {
      const response = await apiClient.get<PolicyListResponse>('/policies', {
        params,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch policies');
      }

      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: previousData => previousData,
  });
};

/**
 * Single policy query hook
 */
export const usePolicy = (
  policyId: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: queryKeys.policies.detail(policyId),
    queryFn: async (): Promise<Policy> => {
      const response = await apiClient.get<Policy>(`/policies/${policyId}`);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch policy');
      }

      return response.data;
    },
    enabled: !!policyId && options?.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Create policy mutation hook
 */
export const useCreatePolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (policyData: CreatePolicyRequest): Promise<Policy> => {
      const response = await apiClient.post<Policy>('/policies', policyData);

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to create policy');
      }

      return response.data;
    },
    onSuccess: newPolicy => {
      // Invalidate policies list queries
      cacheUtils.invalidateEntity('policies');

      // Add new policy to cache
      queryClient.setQueryData(
        queryKeys.policies.detail(newPolicy.id),
        newPolicy
      );

      // Show success notification
      appActions.addNotification({
        type: 'success',
        title: 'Policy Created',
        message: `Policy "${newPolicy.name}" has been created successfully.`,
      });
    },
    onError: (error: ApiErrorType) => {
      appActions.addNotification({
        type: 'error',
        title: 'Create Policy Failed',
        message: error.message || 'Failed to create policy',
      });
    },
  });
};

/**
 * Update policy mutation hook
 */
export const useUpdatePolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      policyId,
      policyData,
    }: {
      policyId: string;
      policyData: UpdatePolicyRequest;
    }): Promise<Policy> => {
      const response = await apiClient.put<Policy>(
        `/policies/${policyId}`,
        policyData
      );

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to update policy');
      }

      return response.data;
    },
    onSuccess: updatedPolicy => {
      // Update policy in cache
      queryClient.setQueryData(
        queryKeys.policies.detail(updatedPolicy.id),
        updatedPolicy
      );

      // Invalidate policies list queries
      cacheUtils.invalidateEntity('policies');

      // Show success notification
      appActions.addNotification({
        type: 'success',
        title: 'Policy Updated',
        message: `Policy "${updatedPolicy.name}" has been updated successfully.`,
      });
    },
    onError: (error: ApiErrorType) => {
      appActions.addNotification({
        type: 'error',
        title: 'Update Policy Failed',
        message: error.message || 'Failed to update policy',
      });
    },
  });
};

/**
 * Delete policy mutation hook
 */
export const useDeletePolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (policyId: string): Promise<void> => {
      const response = await apiClient.delete(`/policies/${policyId}`);

      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to delete policy');
      }
    },
    onSuccess: (_, policyId) => {
      // Remove policy from cache
      queryClient.removeQueries({
        queryKey: queryKeys.policies.detail(policyId),
      });

      // Invalidate policies list queries
      cacheUtils.invalidateEntity('policies');

      // Show success notification
      appActions.addNotification({
        type: 'success',
        title: 'Policy Deleted',
        message: 'Policy has been deleted successfully.',
      });
    },
    onError: (error: ApiErrorType) => {
      appActions.addNotification({
        type: 'error',
        title: 'Delete Policy Failed',
        message: error.message || 'Failed to delete policy',
      });
    },
  });
};

/**
 * Toggle policy status mutation hook
 */
export const useTogglePolicyStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      policyId,
      statusData,
    }: {
      policyId: string;
      statusData: TogglePolicyStatusRequest;
    }): Promise<Policy> => {
      const response = await apiClient.patch<Policy>(
        `/policies/${policyId}/status`,
        statusData
      );

      if (!response.success || !response.data) {
        throw new Error(
          response.error?.message || 'Failed to update policy status'
        );
      }

      return response.data;
    },
    onSuccess: updatedPolicy => {
      // Update policy in cache
      queryClient.setQueryData(
        queryKeys.policies.detail(updatedPolicy.id),
        updatedPolicy
      );

      // Invalidate policies list queries
      cacheUtils.invalidateEntity('policies');

      // Show success notification
      appActions.addNotification({
        type: 'success',
        title: 'Policy Status Updated',
        message: `Policy has been ${updatedPolicy.isActive ? 'activated' : 'deactivated'} successfully.`,
      });
    },
    onError: (error: ApiErrorType) => {
      appActions.addNotification({
        type: 'error',
        title: 'Update Status Failed',
        message: error.message || 'Failed to update policy status',
      });
    },
  });
};

/**
 * Policy evaluation hook
 */
export const usePolicyEvaluation = (request: PolicyEvaluationRequest) => {
  return useQuery({
    queryKey: queryKeys.permissions.evaluation(request),
    queryFn: async (): Promise<PolicyEvaluationResult> => {
      const response = await apiClient.post<PolicyEvaluationResult>(
        '/policies/evaluate',
        request
      );

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to evaluate policy');
      }

      return response.data;
    },
    enabled: !!(request.action && request.resource),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

/**
 * Duplicate policy mutation hook
 */
export const useDuplicatePolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      policyId,
      newName,
    }: {
      policyId: string;
      newName: string;
    }): Promise<Policy> => {
      const response = await apiClient.post<Policy>(
        `/policies/${policyId}/duplicate`,
        { name: newName }
      );

      if (!response.success || !response.data) {
        throw new Error(
          response.error?.message || 'Failed to duplicate policy'
        );
      }

      return response.data;
    },
    onSuccess: newPolicy => {
      // Invalidate policies list queries
      cacheUtils.invalidateEntity('policies');

      // Add new policy to cache
      queryClient.setQueryData(
        queryKeys.policies.detail(newPolicy.id),
        newPolicy
      );

      // Show success notification
      appActions.addNotification({
        type: 'success',
        title: 'Policy Duplicated',
        message: `Policy "${newPolicy.name}" has been created as a copy.`,
      });
    },
    onError: (error: ApiErrorType) => {
      appActions.addNotification({
        type: 'error',
        title: 'Duplicate Policy Failed',
        message: error.message || 'Failed to duplicate policy',
      });
    },
  });
};
