/**
 * User Management Page
 * Lists all users with search, filter, and management capabilities
 * Updated to use @repo/table package
 */

import React, { useState, useMemo, useCallback } from 'react';

import { BasicTable, type TableColumn } from '@repo/table';
import { useNavigate } from '@tanstack/react-router';

// Import UI components
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

import { useUsers, useToggleUserStatus } from '@/hooks/api';
import type { User } from '@/types';

export const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all');

  // Fetch users with search and filter
  const {
    data: users,
    isLoading,
    error,
    refetch,
  } = useUsers({
    search: searchTerm,
    isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
  });

  // Toggle user status mutation
  const toggleStatusMutation = useToggleUserStatus();

  // Prepare data for new table
  const tableData = useMemo(() => {
    return users?.data || [];
  }, [users?.data]);

  // Handle toggle user status
  const handleToggleStatus = useCallback(
    async (user: User) => {
      try {
        await toggleStatusMutation.mutateAsync({
          userId: user.id,
          isActive: !user.isActive,
        });
      } catch {
        // Error is handled by the mutation's onError callback
      }
    },
    [toggleStatusMutation]
  );

  // Define columns for new table
  const columns = useMemo<TableColumn<User>[]>(
    () => [
      {
        id: 'name',
        name: 'Name',
        accessor: (row: User) => `${row.firstName} ${row.lastName}`,
        width: 250,
        cell: ({ row }: { row: User }) => (
          <div className='flex items-center space-x-3'>
            <div className='h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center'>
              <span className='text-xs font-medium text-gray-700'>
                {row.firstName[0]}
                {row.lastName[0]}
              </span>
            </div>
            <div>
              <div className='text-sm font-medium text-gray-900'>
                {row.firstName} {row.lastName}
              </div>
              <div className='text-sm text-gray-500'>{row.email}</div>
            </div>
          </div>
        ),
      },
      {
        id: 'roles',
        name: 'Roles',
        accessor: (row: User) =>
          row.roles?.map(role => role.name).join(', ') || 'No roles',
        width: 200,
        cell: ({ row }: { row: User }) => (
          <div className='flex flex-wrap gap-1'>
            {row.roles?.map((role: { id: string; name: string }) => (
              <span
                key={role.id}
                className='inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800'
              >
                {role.name}
              </span>
            )) || (
              <span className='text-sm text-gray-500'>No roles assigned</span>
            )}
          </div>
        ),
      },
      {
        id: 'status',
        name: 'Status',
        accessor: 'isActive',
        width: 100,
        cell: ({ row }: { row: User }) => (
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              row.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {row.isActive ? 'Active' : 'Inactive'}
          </span>
        ),
      },
      {
        id: 'lastLogin',
        name: 'Last Login',
        accessor: 'lastLoginAt',
        width: 150,
        cell: ({ row }: { row: User }) => (
          <span className='text-sm text-gray-900'>
            {row.lastLoginAt
              ? new Date(row.lastLoginAt).toLocaleDateString()
              : 'Never'}
          </span>
        ),
      },
      {
        id: 'actions',
        name: 'Actions',
        width: 150,
        cell: ({ row }: { row: User }) => (
          <div className='flex space-x-2'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => navigate({ to: `/users/${row.id}/edit` })}
            >
              Edit
            </Button>
            <Button
              variant='ghost'
              size='sm'
              disabled={toggleStatusMutation.isPending}
              onClick={() => handleToggleStatus(row)}
              className={
                row.isActive
                  ? 'text-red-600 hover:text-red-700'
                  : 'text-green-600 hover:text-green-700'
              }
            >
              {row.isActive ? 'Deactivate' : 'Activate'}
            </Button>
          </div>
        ),
      },
    ],
    [navigate, toggleStatusMutation.isPending, handleToggleStatus]
  );

  const handleCreateUser = () => {
    navigate({ to: '/users/create' });
  };

  // Handle error state
  if (error) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <div className='max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>
          <Alert variant='destructive' className='mt-20'>
            <AlertDescription>
              Failed to load users. Please try again.
              <Button
                variant='outline'
                size='sm'
                onClick={() => refetch()}
                className='ml-2'
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
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
              User Management
            </h1>
            <Button onClick={handleCreateUser}>Create User</Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
        <div className='px-4 py-6 sm:px-0'>
          {/* Filters */}
          <Card className='mb-6'>
            <CardContent className='pt-6'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div>
                  <label
                    htmlFor='search'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Search Users
                  </label>
                  <Input
                    id='search'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder='Search by name or email...'
                  />
                </div>

                <div>
                  <label
                    htmlFor='status'
                    className='block text-sm font-medium text-gray-700 mb-2'
                  >
                    Status Filter
                  </label>
                  <Select
                    value={statusFilter}
                    onValueChange={(value: 'all' | 'active' | 'inactive') =>
                      setStatusFilter(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select status' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='all'>All Users</SelectItem>
                      <SelectItem value='active'>Active Only</SelectItem>
                      <SelectItem value='inactive'>Inactive Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className='flex items-end'>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                    className='w-full'
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users Table - Using @repo/table */}
          <Card>
            <CardHeader>
              <CardTitle>Users ({tableData.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className='space-y-4'>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className='flex space-x-4'>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <Skeleton key={j} className='h-4 w-20' />
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div className='w-full'>
                  <BasicTable
                    data={tableData}
                    columns={columns}
                    className='border rounded-lg'
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
