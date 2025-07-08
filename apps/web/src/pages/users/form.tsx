/**
 * User Form Page
 * Create and edit user forms with role assignment
 */

import { useNavigate, useParams } from '@tanstack/react-router';
import React, { useEffect } from 'react';

import { useUser, useRoles, useCreateUser, useUpdateUser } from '@/hooks/api';
import { useForm } from '@/hooks/ui';
import type { User, Role } from '@/types';

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  roleIds?: string[];
  isActive: boolean;
}

export const UserFormPage: React.FC = () => {
  const navigate = useNavigate();
  const params = useParams({ from: '/users/$userId/edit' }) as {
    userId?: string;
  };
  const isEditing = Boolean(params?.userId);

  // API hooks
  const { data: user, isLoading: userLoading } = useUser(params?.userId || '', {
    enabled: isEditing && Boolean(params?.userId),
  });
  const { data: roles } = useRoles();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();

  // Form configuration
  const form = useForm<UserFormData>({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      roleIds: [],
      isActive: true,
    },
    // validationSchema: isEditing ? validationSchemas.userEdit : validationSchemas.userCreate,
    onSubmit: async values => {
      if (isEditing && params?.userId) {
        await updateUserMutation.mutateAsync({
          id: params.userId,
          data: {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            roleIds: values.roleIds,
            isActive: values.isActive,
          },
        });
      } else {
        await createUserMutation.mutateAsync({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password || '',
          roleIds: values.roleIds,
          isActive: values.isActive,
        });
      }
    },
    onSuccess: () => {
      navigate({ to: '/users' });
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (user?.data && isEditing) {
      const userData = user.data as User;
      form.setFieldValue('firstName', userData.firstName);
      form.setFieldValue('lastName', userData.lastName);
      form.setFieldValue('email', userData.email);
      form.setFieldValue(
        'roleIds',
        userData.roles?.map((role: Role) => role.id) || []
      );
      form.setFieldValue('isActive', userData.isActive);
    }
  }, [user?.data, isEditing, form]);

  const formState = form.getFormState();

  if (userLoading && isEditing) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow'>
        <div className='max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center'>
            <h1 className='text-3xl font-bold text-gray-900'>
              {isEditing ? 'Edit User' : 'Create User'}
            </h1>
            <button
              onClick={() => navigate({ to: '/users' })}
              className='bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
            >
              Back to Users
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='max-w-3xl mx-auto py-6 sm:px-6 lg:px-8'>
        <div className='px-4 py-6 sm:px-0'>
          <div className='bg-white shadow rounded-lg'>
            <form onSubmit={form.handleSubmit} className='space-y-6 p-6'>
              {/* Personal Information */}
              <div>
                <h3 className='text-lg font-medium text-gray-900 mb-4'>
                  Personal Information
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <form.form.Field name='firstName'>
                    {field => (
                      <div>
                        <label
                          htmlFor='firstName'
                          className='block text-sm font-medium text-gray-700 mb-2'
                        >
                          First Name *
                        </label>
                        <input
                          type='text'
                          id='firstName'
                          value={field.state.value}
                          onChange={e => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        />
                        {field.state.meta.errors &&
                          field.state.meta.errors.length > 0 && (
                            <p className='mt-1 text-sm text-red-600'>
                              {String(field.state.meta.errors[0])}
                            </p>
                          )}
                      </div>
                    )}
                  </form.form.Field>

                  <form.form.Field name='lastName'>
                    {field => (
                      <div>
                        <label
                          htmlFor='lastName'
                          className='block text-sm font-medium text-gray-700 mb-2'
                        >
                          Last Name *
                        </label>
                        <input
                          type='text'
                          id='lastName'
                          value={field.state.value}
                          onChange={e => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        />
                        {field.state.meta.errors &&
                          field.state.meta.errors.length > 0 && (
                            <p className='mt-1 text-sm text-red-600'>
                              {String(field.state.meta.errors[0])}
                            </p>
                          )}
                      </div>
                    )}
                  </form.form.Field>
                </div>

                <form.form.Field name='email'>
                  {field => (
                    <div className='mt-6'>
                      <label
                        htmlFor='email'
                        className='block text-sm font-medium text-gray-700 mb-2'
                      >
                        Email Address *
                      </label>
                      <input
                        type='email'
                        id='email'
                        value={field.state.value}
                        onChange={e => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                      />
                      {field.state.meta.errors &&
                        field.state.meta.errors.length > 0 && (
                          <p className='mt-1 text-sm text-red-600'>
                            {String(field.state.meta.errors[0])}
                          </p>
                        )}
                    </div>
                  )}
                </form.form.Field>
              </div>

              {/* Password Section (only for new users) */}
              {!isEditing && (
                <div>
                  <h3 className='text-lg font-medium text-gray-900 mb-4'>
                    Password
                  </h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <form.form.Field name='password'>
                      {field => (
                        <div>
                          <label
                            htmlFor='password'
                            className='block text-sm font-medium text-gray-700 mb-2'
                          >
                            Password *
                          </label>
                          <input
                            type='password'
                            id='password'
                            value={field.state.value}
                            onChange={e => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                          />
                          {field.state.meta.errors &&
                            field.state.meta.errors.length > 0 && (
                              <p className='mt-1 text-sm text-red-600'>
                                {String(field.state.meta.errors[0])}
                              </p>
                            )}
                        </div>
                      )}
                    </form.form.Field>

                    <form.form.Field name='confirmPassword'>
                      {field => (
                        <div>
                          <label
                            htmlFor='confirmPassword'
                            className='block text-sm font-medium text-gray-700 mb-2'
                          >
                            Confirm Password *
                          </label>
                          <input
                            type='password'
                            id='confirmPassword'
                            value={field.state.value}
                            onChange={e => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                          />
                          {field.state.meta.errors &&
                            field.state.meta.errors.length > 0 && (
                              <p className='mt-1 text-sm text-red-600'>
                                {String(field.state.meta.errors[0])}
                              </p>
                            )}
                        </div>
                      )}
                    </form.form.Field>
                  </div>
                </div>
              )}

              {/* Role Assignment */}
              <form.form.Field name='roleIds'>
                {field => (
                  <div>
                    <h3 className='text-lg font-medium text-gray-900 mb-4'>
                      Role Assignment
                    </h3>
                    <div className='space-y-3'>
                      {roles?.roles?.map((role: Role) => (
                        <label key={role.id} className='flex items-center'>
                          <input
                            type='checkbox'
                            value={role.id}
                            checked={
                              field.state.value?.includes(role.id) || false
                            }
                            onChange={e => {
                              const currentValues = field.state.value || [];
                              if (e.target.checked) {
                                field.handleChange([...currentValues, role.id]);
                              } else {
                                field.handleChange(
                                  currentValues.filter(
                                    (id: string) => id !== role.id
                                  )
                                );
                              }
                            }}
                            className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                          />
                          <span className='ml-3 text-sm text-gray-700'>
                            <span className='font-medium'>{role.name}</span>
                            {role.description && (
                              <span className='text-gray-500'>
                                {' '}
                                - {role.description}
                              </span>
                            )}
                          </span>
                        </label>
                      ))}
                    </div>
                    {field.state.meta.errors &&
                      field.state.meta.errors.length > 0 && (
                        <p className='mt-1 text-sm text-red-600'>
                          {String(field.state.meta.errors[0])}
                        </p>
                      )}
                  </div>
                )}
              </form.form.Field>

              {/* Status */}
              <form.form.Field name='isActive'>
                {field => (
                  <div>
                    <h3 className='text-lg font-medium text-gray-900 mb-4'>
                      Status
                    </h3>
                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={field.state.value || false}
                        onChange={e => field.handleChange(e.target.checked)}
                        className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                      />
                      <span className='ml-3 text-sm text-gray-700'>
                        Active (user can log in and access the system)
                      </span>
                    </label>
                  </div>
                )}
              </form.form.Field>

              {/* Form Actions */}
              <div className='flex justify-end space-x-4 pt-6 border-t border-gray-200'>
                <button
                  type='button'
                  onClick={() => navigate({ to: '/users' })}
                  className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={formState.isSubmitting}
                  className='px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {formState.isSubmitting
                    ? 'Saving...'
                    : isEditing
                      ? 'Update User'
                      : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserFormPage;
