/**
 * Role Form Page
 * Create and edit role form with policy assignment
 */

import { useNavigate, useParams } from '@tanstack/react-router';
import React, { useEffect } from 'react';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { usePolicies } from '@/hooks/api/use-policies-api';
import {
  useRole,
  useCreateRole,
  useUpdateRole,
} from '@/hooks/api/use-roles-api';
import { useForm } from '@/hooks/ui/use-form';
import type { CreateRoleRequest, UpdateRoleRequest } from '@/types';

interface RoleFormData {
  name: string;
  description: string;
  policyIds: string[];
  isSystemRole: boolean;
  metadata: Record<string, unknown>;
}

export const RoleFormPage: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams({ from: '/roles/$roleId/edit' }) as {
    roleId?: string;
  };
  const isEditing = Boolean(params?.roleId);

  // API hooks
  const { data: role, isLoading: roleLoading } = useRole(params?.roleId || '', {
    enabled: isEditing && Boolean(params?.roleId),
  });
  const { data: policies } = usePolicies();
  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();

  // Form configuration
  const form = useForm<RoleFormData>({
    initialValues: {
      name: '',
      description: '',
      policyIds: [],
      isSystemRole: false,
      metadata: {},
    },
    onSubmit: async values => {
      if (isEditing && params?.roleId) {
        const updateData: UpdateRoleRequest = {
          name: values.name,
          description: values.description || undefined,
          policyIds: values.policyIds,
          metadata: values.metadata,
        };
        await updateRoleMutation.mutateAsync({
          roleId: params.roleId,
          updates: updateData,
        });
      } else {
        const createData: CreateRoleRequest = {
          name: values.name,
          description: values.description || undefined,
          policyIds: values.policyIds,
          isSystemRole: values.isSystemRole,
          metadata: values.metadata,
        };
        await createRoleMutation.mutateAsync(createData);
      }
    },
    onSuccess: () => {
      navigate({ to: '/roles' });
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (isEditing && role) {
      form.setValues({
        name: role.name,
        description: role.description || '',
        policyIds: role.policies?.map(p => p.id) || [],
        isSystemRole: role.isSystemRole,
        metadata: role.metadata || {},
      });
    }
  }, [isEditing, role, form]);

  const handlePolicyToggle = (policyId: string, checked: boolean) => {
    const currentPolicyIds = form.form.state.values.policyIds;
    const newPolicyIds = checked
      ? [...currentPolicyIds, policyId]
      : currentPolicyIds.filter((id: string) => id !== policyId);

    form.setFieldValue('policyIds', newPolicyIds);
  };

  if (isEditing && roleLoading) {
    return (
      <ProtectedRoute requiredPermissions={['roles:update']}>
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600'></div>
        </div>
      </ProtectedRoute>
    );
  }

  const requiredPermissions = isEditing ? ['roles:update'] : ['roles:create'];

  return (
    <ProtectedRoute requiredPermissions={requiredPermissions}>
      <div className='max-w-4xl mx-auto space-y-6'>
        {/* Header */}
        <div className='flex justify-between items-center'>
          <h1 className='text-3xl font-bold text-gray-900'>
            {isEditing ? 'Edit Role' : 'Create Role'}
          </h1>
          <button
            onClick={() => navigate({ to: '/roles' })}
            className='bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
          >
            Back to Roles
          </button>
        </div>

        {/* Form */}
        <form onSubmit={form.handleSubmit} className='space-y-6'>
          {/* Basic Information */}
          <div className='bg-white shadow rounded-lg p-6'>
            <h2 className='text-lg font-medium text-gray-900 mb-4'>
              Basic Information
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <form.form.Field name='name'>
                {field => (
                  <div>
                    <label
                      htmlFor='name'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Role Name *
                    </label>
                    <input
                      id='name'
                      type='text'
                      value={field.state.value}
                      onChange={e => field.handleChange(e.target.value)}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      placeholder='Enter role name'
                      required
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className='mt-1 text-sm text-red-600'>
                        {String(field.state.meta.errors[0])}
                      </p>
                    )}
                  </div>
                )}
              </form.form.Field>

              <form.form.Field name='description'>
                {field => (
                  <div>
                    <label
                      htmlFor='description'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Description
                    </label>
                    <textarea
                      id='description'
                      value={field.state.value}
                      onChange={e => field.handleChange(e.target.value)}
                      rows={3}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      placeholder='Enter role description'
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className='mt-1 text-sm text-red-600'>
                        {String(field.state.meta.errors[0])}
                      </p>
                    )}
                  </div>
                )}
              </form.form.Field>
            </div>

            {/* System Role Toggle (only for creation) */}
            {!isEditing && (
              <div className='mt-6'>
                <form.form.Field name='isSystemRole'>
                  {field => (
                    <div>
                      <label className='flex items-center'>
                        <input
                          type='checkbox'
                          checked={field.state.value || false}
                          onChange={e => field.handleChange(e.target.checked)}
                          className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                        />
                        <span className='ml-3 text-sm text-gray-700'>
                          System Role (cannot be deleted by users)
                        </span>
                      </label>
                    </div>
                  )}
                </form.form.Field>
              </div>
            )}
          </div>

          {/* Policy Assignment */}
          <div className='bg-white shadow rounded-lg p-6'>
            <h2 className='text-lg font-medium text-gray-900 mb-4'>
              Policy Assignment
            </h2>
            <p className='text-sm text-gray-600 mb-4'>
              Select the policies that should be assigned to this role. Users
              with this role will inherit all selected policies.
            </p>

            {policies?.policies && policies.policies.length > 0 ? (
              <div className='space-y-3 max-h-96 overflow-y-auto'>
                {policies.policies.map(policy => (
                  <div
                    key={policy.id}
                    className='flex items-start space-x-3 p-3 border border-gray-200 rounded-md'
                  >
                    <input
                      type='checkbox'
                      id={`policy-${policy.id}`}
                      checked={form.form.state.values.policyIds.includes(
                        policy.id
                      )}
                      onChange={e =>
                        handlePolicyToggle(policy.id, e.target.checked)
                      }
                      className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1'
                    />
                    <div className='flex-1'>
                      <label
                        htmlFor={`policy-${policy.id}`}
                        className='block text-sm font-medium text-gray-900 cursor-pointer'
                      >
                        {policy.name}
                      </label>
                      {policy.description && (
                        <p className='text-sm text-gray-600 mt-1'>
                          {policy.description}
                        </p>
                      )}
                      <div className='flex items-center space-x-4 mt-2 text-xs text-gray-500'>
                        <span>Effect: {policy.effect}</span>
                        <span>Priority: {policy.priority}</span>
                        <span>Actions: {policy.actions.join(', ')}</span>
                        <span>Resources: {policy.resources.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-8 text-gray-500'>
                No policies available. Create policies first to assign them to
                roles.
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className='flex justify-end space-x-4'>
            <button
              type='button'
              onClick={() => navigate({ to: '/roles' })}
              className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={form.formState.isSubmitting}
              className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {form.formState.isSubmitting ? (
                <div className='flex items-center'>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </div>
              ) : isEditing ? (
                'Update Role'
              ) : (
                'Create Role'
              )}
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
};
