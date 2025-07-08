/**
 * Policy Form Page
 * Create and edit policy form with conditions, actions, and resources
 */

import { useNavigate, useParams } from '@tanstack/react-router';
import React, { useEffect, useState } from 'react';

import { ProtectedRoute } from '@/components/auth/protected-route';
import {
  usePolicy,
  useCreatePolicy,
  useUpdatePolicy,
} from '@/hooks/api/use-policies-api';
import { useForm } from '@/hooks/ui/use-form';
import type {
  CreatePolicyRequest,
  UpdatePolicyRequest,
  PolicyConditions,
  SystemAction,
  SystemResource,
} from '@/types';

interface PolicyFormData {
  name: string;
  description: string;
  effect: 'allow' | 'deny';
  actions: string[];
  resources: string[];
  priority: number;
  isActive: boolean;
  conditions: PolicyConditions;
}

// Predefined actions and resources based on the system
const SYSTEM_ACTIONS: SystemAction[] = [
  'create',
  'read',
  'update',
  'delete',
  'list',
  'assign',
  'unassign',
  'activate',
  'deactivate',
];

const SYSTEM_RESOURCES: SystemResource[] = [
  'users',
  'roles',
  'policies',
  'permissions',
  'profile',
  'auth',
];

export const PolicyFormPage: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams({ from: '/policies/$policyId/edit' });
  const isEditing = !!params?.policyId;

  // State for dynamic actions and resources
  const [customActions, setCustomActions] = useState<string[]>([]);
  const [customResources, setCustomResources] = useState<string[]>([]);
  const [newAction, setNewAction] = useState('');
  const [newResource, setNewResource] = useState('');

  // API hooks
  const { data: policy, isLoading: policyLoading } = usePolicy(
    params?.policyId || '',
    { enabled: isEditing }
  );
  const createPolicyMutation = useCreatePolicy();
  const updatePolicyMutation = useUpdatePolicy();

  // Form configuration
  const form = useForm<PolicyFormData>({
    initialValues: {
      name: '',
      description: '',
      effect: 'allow',
      actions: [],
      resources: [],
      priority: 0,
      isActive: true,
      conditions: {},
    },
    onSubmit: async values => {
      if (isEditing && params?.policyId) {
        const updateData: UpdatePolicyRequest = {
          name: values.name,
          description: values.description || undefined,
          effect: values.effect,
          actions: values.actions,
          resources: values.resources,
          priority: values.priority,
          isActive: values.isActive,
          conditions: values.conditions,
        };
        await updatePolicyMutation.mutateAsync({
          policyId: params.policyId,
          policyData: updateData,
        });
      } else {
        const createData: CreatePolicyRequest = {
          name: values.name,
          description: values.description || undefined,
          effect: values.effect,
          actions: values.actions,
          resources: values.resources,
          priority: values.priority,
          conditions: values.conditions,
        };
        await createPolicyMutation.mutateAsync(createData);
      }
    },
    onSuccess: () => {
      navigate({ to: '/policies' });
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (isEditing && policy) {
      form.setValues({
        name: policy.name,
        description: policy.description || '',
        effect: policy.effect,
        actions: policy.actions,
        resources: policy.resources,
        priority: policy.priority,
        isActive: policy.isActive,
        conditions: policy.conditions || {},
      });

      // Set custom actions and resources
      const customActionsFromPolicy = policy.actions.filter(
        action => !SYSTEM_ACTIONS.includes(action as SystemAction)
      );
      const customResourcesFromPolicy = policy.resources.filter(
        resource => !SYSTEM_RESOURCES.includes(resource as SystemResource)
      );

      setCustomActions(customActionsFromPolicy);
      setCustomResources(customResourcesFromPolicy);
    }
  }, [isEditing, policy, form]);

  const handleActionToggle = (action: string, checked: boolean) => {
    const currentActions = form.form.state.values.actions;
    const newActions = checked
      ? [...currentActions, action]
      : currentActions.filter((a: string) => a !== action);

    form.setFieldValue('actions', newActions);
  };

  const handleResourceToggle = (resource: string, checked: boolean) => {
    const currentResources = form.form.state.values.resources;
    const newResources = checked
      ? [...currentResources, resource]
      : currentResources.filter((r: string) => r !== resource);

    form.setFieldValue('resources', newResources);
  };

  const handleAddCustomAction = () => {
    if (newAction.trim() && !customActions.includes(newAction.trim())) {
      const updatedCustomActions = [...customActions, newAction.trim()];
      setCustomActions(updatedCustomActions);
      handleActionToggle(newAction.trim(), true);
      setNewAction('');
    }
  };

  const handleAddCustomResource = () => {
    if (newResource.trim() && !customResources.includes(newResource.trim())) {
      const updatedCustomResources = [...customResources, newResource.trim()];
      setCustomResources(updatedCustomResources);
      handleResourceToggle(newResource.trim(), true);
      setNewResource('');
    }
  };

  const handleRemoveCustomAction = (action: string) => {
    setCustomActions(customActions.filter(a => a !== action));
    handleActionToggle(action, false);
  };

  const handleRemoveCustomResource = (resource: string) => {
    setCustomResources(customResources.filter(r => r !== resource));
    handleResourceToggle(resource, false);
  };

  const requiredPermissions = isEditing
    ? ['policies:update']
    : ['policies:create'];

  if (policyLoading) {
    return (
      <ProtectedRoute requiredPermissions={requiredPermissions}>
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600'></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredPermissions={requiredPermissions}>
      <div className='max-w-4xl mx-auto space-y-6'>
        {/* Header */}
        <div className='flex justify-between items-center'>
          <h1 className='text-3xl font-bold text-gray-900'>
            {isEditing ? 'Edit Policy' : 'Create Policy'}
          </h1>
          <button
            onClick={() => navigate({ to: '/policies' })}
            className='text-gray-600 hover:text-gray-900'
          >
            Back to Policies
          </button>
        </div>

        {/* Form */}
        <form onSubmit={form.handleSubmit} className='space-y-6'>
          {/* Basic Information */}
          <div className='bg-white p-6 rounded-lg shadow'>
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
                      Policy Name *
                    </label>
                    <input
                      id='name'
                      type='text'
                      value={field.state.value}
                      onChange={e => field.handleChange(e.target.value)}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      placeholder='Enter policy name'
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className='mt-1 text-sm text-red-600'>
                        {String(field.state.meta.errors[0])}
                      </p>
                    )}
                  </div>
                )}
              </form.form.Field>

              <form.form.Field name='effect'>
                {field => (
                  <div>
                    <label
                      htmlFor='effect'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Effect *
                    </label>
                    <select
                      id='effect'
                      value={field.state.value}
                      onChange={e =>
                        field.handleChange(e.target.value as 'allow' | 'deny')
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    >
                      <option value='allow'>Allow</option>
                      <option value='deny'>Deny</option>
                    </select>
                  </div>
                )}
              </form.form.Field>

              <form.form.Field name='description'>
                {field => (
                  <div className='md:col-span-2'>
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
                      placeholder='Enter policy description'
                    />
                  </div>
                )}
              </form.form.Field>

              <form.form.Field name='priority'>
                {field => (
                  <div>
                    <label
                      htmlFor='priority'
                      className='block text-sm font-medium text-gray-700 mb-2'
                    >
                      Priority
                    </label>
                    <input
                      id='priority'
                      type='number'
                      value={field.state.value}
                      onChange={e => field.handleChange(Number(e.target.value))}
                      min='0'
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      placeholder='0'
                    />
                    <p className='mt-1 text-sm text-gray-500'>
                      Higher priority policies are evaluated first
                    </p>
                  </div>
                )}
              </form.form.Field>

              <form.form.Field name='isActive'>
                {field => (
                  <div className='flex items-center'>
                    <input
                      id='isActive'
                      type='checkbox'
                      checked={field.state.value}
                      onChange={e => field.handleChange(e.target.checked)}
                      className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                    />
                    <label
                      htmlFor='isActive'
                      className='ml-2 block text-sm text-gray-900'
                    >
                      Active Policy
                    </label>
                  </div>
                )}
              </form.form.Field>
            </div>
          </div>

          {/* Actions */}
          <div className='bg-white p-6 rounded-lg shadow'>
            <h2 className='text-lg font-medium text-gray-900 mb-4'>
              Actions *
            </h2>
            <div className='space-y-4'>
              <div>
                <h3 className='text-sm font-medium text-gray-700 mb-2'>
                  System Actions
                </h3>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
                  {SYSTEM_ACTIONS.map(action => (
                    <label key={action} className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={form.form.state.values.actions.includes(
                          action
                        )}
                        onChange={e =>
                          handleActionToggle(action, e.target.checked)
                        }
                        className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                      />
                      <span className='ml-2 text-sm text-gray-900'>
                        {action}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className='text-sm font-medium text-gray-700 mb-2'>
                  Custom Actions
                </h3>
                <div className='flex space-x-2 mb-2'>
                  <input
                    type='text'
                    value={newAction}
                    onChange={e => setNewAction(e.target.value)}
                    placeholder='Enter custom action'
                    className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    onKeyPress={e =>
                      e.key === 'Enter' &&
                      (e.preventDefault(), handleAddCustomAction())
                    }
                  />
                  <button
                    type='button'
                    onClick={handleAddCustomAction}
                    className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  >
                    Add
                  </button>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {customActions.map(action => (
                    <span
                      key={action}
                      className='inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800'
                    >
                      {action}
                      <button
                        type='button'
                        onClick={() => handleRemoveCustomAction(action)}
                        className='ml-2 text-blue-600 hover:text-blue-800'
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <form.form.Field name='actions'>
              {field =>
                field.state.meta.errors.length > 0 && (
                  <p className='mt-2 text-sm text-red-600'>
                    {String(field.state.meta.errors[0])}
                  </p>
                )
              }
            </form.form.Field>
          </div>

          {/* Resources */}
          <div className='bg-white p-6 rounded-lg shadow'>
            <h2 className='text-lg font-medium text-gray-900 mb-4'>
              Resources *
            </h2>
            <div className='space-y-4'>
              <div>
                <h3 className='text-sm font-medium text-gray-700 mb-2'>
                  System Resources
                </h3>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
                  {SYSTEM_RESOURCES.map(resource => (
                    <label key={resource} className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={form.form.state.values.resources.includes(
                          resource
                        )}
                        onChange={e =>
                          handleResourceToggle(resource, e.target.checked)
                        }
                        className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                      />
                      <span className='ml-2 text-sm text-gray-900'>
                        {resource}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className='text-sm font-medium text-gray-700 mb-2'>
                  Custom Resources
                </h3>
                <div className='flex space-x-2 mb-2'>
                  <input
                    type='text'
                    value={newResource}
                    onChange={e => setNewResource(e.target.value)}
                    placeholder='Enter custom resource'
                    className='flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    onKeyPress={e =>
                      e.key === 'Enter' &&
                      (e.preventDefault(), handleAddCustomResource())
                    }
                  />
                  <button
                    type='button'
                    onClick={handleAddCustomResource}
                    className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  >
                    Add
                  </button>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {customResources.map(resource => (
                    <span
                      key={resource}
                      className='inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800'
                    >
                      {resource}
                      <button
                        type='button'
                        onClick={() => handleRemoveCustomResource(resource)}
                        className='ml-2 text-purple-600 hover:text-purple-800'
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <form.form.Field name='resources'>
              {field =>
                field.state.meta.errors.length > 0 && (
                  <p className='mt-2 text-sm text-red-600'>
                    {String(field.state.meta.errors[0])}
                  </p>
                )
              }
            </form.form.Field>
          </div>

          {/* Conditions */}
          <div className='bg-white p-6 rounded-lg shadow'>
            <h2 className='text-lg font-medium text-gray-900 mb-4'>
              Conditions (Optional)
            </h2>
            <div className='space-y-6'>
              {/* Environment Conditions */}
              <div>
                <h3 className='text-sm font-medium text-gray-700 mb-3'>
                  Environment Conditions
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Time Range
                    </label>
                    <div className='grid grid-cols-2 gap-2'>
                      <input
                        type='time'
                        placeholder='Start time'
                        value={
                          form.form.state.values.conditions.environment
                            ?.timeRange?.start || ''
                        }
                        onChange={e => {
                          const conditions = {
                            ...form.form.state.values.conditions,
                          };
                          if (!conditions.environment)
                            conditions.environment = {};
                          if (!conditions.environment.timeRange)
                            conditions.environment.timeRange = {};
                          conditions.environment.timeRange.start =
                            e.target.value;
                          form.setFieldValue('conditions', conditions);
                        }}
                        className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      />
                      <input
                        type='time'
                        placeholder='End time'
                        value={
                          form.form.state.values.conditions.environment
                            ?.timeRange?.end || ''
                        }
                        onChange={e => {
                          const conditions = {
                            ...form.form.state.values.conditions,
                          };
                          if (!conditions.environment)
                            conditions.environment = {};
                          if (!conditions.environment.timeRange)
                            conditions.environment.timeRange = {};
                          conditions.environment.timeRange.end = e.target.value;
                          form.setFieldValue('conditions', conditions);
                        }}
                        className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      />
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      IP Whitelist (comma-separated)
                    </label>
                    <input
                      type='text'
                      placeholder='192.168.1.0/24, 10.0.0.0/8'
                      value={
                        form.form.state.values.conditions.environment?.ipWhitelist?.join(
                          ', '
                        ) || ''
                      }
                      onChange={e => {
                        const conditions = {
                          ...form.form.state.values.conditions,
                        };
                        if (!conditions.environment)
                          conditions.environment = {};
                        conditions.environment.ipWhitelist = e.target.value
                          .split(',')
                          .map(ip => ip.trim())
                          .filter(ip => ip.length > 0);
                        form.setFieldValue('conditions', conditions);
                      }}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      IP Blacklist (comma-separated)
                    </label>
                    <input
                      type='text'
                      placeholder='192.168.1.100, 10.0.0.50'
                      value={
                        form.form.state.values.conditions.environment?.ipBlacklist?.join(
                          ', '
                        ) || ''
                      }
                      onChange={e => {
                        const conditions = {
                          ...form.form.state.values.conditions,
                        };
                        if (!conditions.environment)
                          conditions.environment = {};
                        conditions.environment.ipBlacklist = e.target.value
                          .split(',')
                          .map(ip => ip.trim())
                          .filter(ip => ip.length > 0);
                        form.setFieldValue('conditions', conditions);
                      }}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Locations (comma-separated)
                    </label>
                    <input
                      type='text'
                      placeholder='US, CA, UK'
                      value={
                        form.form.state.values.conditions.environment?.location?.join(
                          ', '
                        ) || ''
                      }
                      onChange={e => {
                        const conditions = {
                          ...form.form.state.values.conditions,
                        };
                        if (!conditions.environment)
                          conditions.environment = {};
                        conditions.environment.location = e.target.value
                          .split(',')
                          .map(loc => loc.trim())
                          .filter(loc => loc.length > 0);
                        form.setFieldValue('conditions', conditions);
                      }}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    />
                  </div>
                </div>
              </div>

              {/* User Conditions */}
              <div>
                <h3 className='text-sm font-medium text-gray-700 mb-3'>
                  User Conditions
                </h3>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    User Attributes (JSON format)
                  </label>
                  <textarea
                    rows={3}
                    placeholder='{"department": "engineering", "level": "senior"}'
                    value={JSON.stringify(
                      form.form.state.values.conditions.user?.attributes || {},
                      null,
                      2
                    )}
                    onChange={e => {
                      try {
                        const attributes = JSON.parse(e.target.value || '{}');
                        const conditions = {
                          ...form.form.state.values.conditions,
                        };
                        if (!conditions.user) conditions.user = {};
                        conditions.user.attributes = attributes;
                        form.setFieldValue('conditions', conditions);
                      } catch {
                        // Invalid JSON, ignore
                      }
                    }}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm'
                  />
                  <p className='mt-1 text-sm text-gray-500'>
                    Enter user attributes as JSON. Leave empty for no user
                    conditions.
                  </p>
                </div>
              </div>

              {/* Resource Conditions */}
              <div>
                <h3 className='text-sm font-medium text-gray-700 mb-3'>
                  Resource Conditions
                </h3>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Resource Attributes (JSON format)
                  </label>
                  <textarea
                    rows={3}
                    placeholder='{"owner": "user123", "status": "active"}'
                    value={JSON.stringify(
                      form.form.state.values.conditions.resource?.attributes ||
                        {},
                      null,
                      2
                    )}
                    onChange={e => {
                      try {
                        const attributes = JSON.parse(e.target.value || '{}');
                        const conditions = {
                          ...form.form.state.values.conditions,
                        };
                        if (!conditions.resource) conditions.resource = {};
                        conditions.resource.attributes = attributes;
                        form.setFieldValue('conditions', conditions);
                      } catch {
                        // Invalid JSON, ignore
                      }
                    }}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm'
                  />
                  <p className='mt-1 text-sm text-gray-500'>
                    Enter resource attributes as JSON. Leave empty for no
                    resource conditions.
                  </p>
                </div>
              </div>

              {/* Custom Conditions */}
              <div>
                <h3 className='text-sm font-medium text-gray-700 mb-3'>
                  Custom Conditions
                </h3>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Custom Conditions (JSON format)
                  </label>
                  <textarea
                    rows={3}
                    placeholder='{"customField": "customValue"}'
                    value={JSON.stringify(
                      form.form.state.values.conditions.custom || {},
                      null,
                      2
                    )}
                    onChange={e => {
                      try {
                        const custom = JSON.parse(e.target.value || '{}');
                        const conditions = {
                          ...form.form.state.values.conditions,
                        };
                        conditions.custom = custom;
                        form.setFieldValue('conditions', conditions);
                      } catch {
                        // Invalid JSON, ignore
                      }
                    }}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm'
                  />
                  <p className='mt-1 text-sm text-gray-500'>
                    Enter custom conditions as JSON. Leave empty for no custom
                    conditions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className='flex justify-end space-x-4'>
            <button
              type='button'
              onClick={() => navigate({ to: '/policies' })}
              className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={form.form.state.isSubmitting}
              className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {form.form.state.isSubmitting
                ? isEditing
                  ? 'Updating...'
                  : 'Creating...'
                : isEditing
                  ? 'Update Policy'
                  : 'Create Policy'}
            </button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
};
