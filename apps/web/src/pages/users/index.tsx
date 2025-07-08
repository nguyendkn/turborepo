/**
 * User Management Page
 * Lists all users with search, filter, and management capabilities
 */

import { useNavigate } from '@tanstack/react-router';
import React, { useState } from 'react';

import { SkeletonTable, ErrorWithRetry, LoadingButton } from '@/components/ui';
import { useUsers, useToggleUserStatus } from '@/hooks/api';
import { useTable } from '@/hooks/ui';
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

  // Table configuration
  const table = useTable<User>({
    data: users?.data || [],
    columns: [
      {
        id: 'name',
        header: 'Name',
        accessorFn: row => `${row.firstName} ${row.lastName}`,
        cell: ({ row }) => (
          <div className='flex items-center'>
            <div className='flex-shrink-0 h-10 w-10'>
              <div className='h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center'>
                <span className='text-sm font-medium text-gray-700'>
                  {row.original.firstName[0]}
                  {row.original.lastName[0]}
                </span>
              </div>
            </div>
            <div className='ml-4'>
              <div className='text-sm font-medium text-gray-900'>
                {row.original.firstName} {row.original.lastName}
              </div>
              <div className='text-sm text-gray-500'>{row.original.email}</div>
            </div>
          </div>
        ),
      },
      {
        id: 'roles',
        header: 'Roles',
        accessorFn: row =>
          row.roles?.map(role => role.name).join(', ') || 'No roles',
        cell: ({ row }) => (
          <div className='flex flex-wrap gap-1'>
            {row.original.roles?.map(role => (
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
        header: 'Status',
        accessorKey: 'isActive',
        cell: ({ row }) => (
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              row.original.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {row.original.isActive ? 'Active' : 'Inactive'}
          </span>
        ),
      },
      {
        id: 'lastLogin',
        header: 'Last Login',
        accessorKey: 'lastLoginAt',
        cell: ({ row }) => (
          <span className='text-sm text-gray-900'>
            {row.original.lastLoginAt
              ? new Date(row.original.lastLoginAt).toLocaleDateString()
              : 'Never'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex space-x-2'>
            <button
              onClick={() => navigate({ to: `/users/${row.original.id}/edit` })}
              className='text-blue-600 hover:text-blue-900 text-sm font-medium'
            >
              Edit
            </button>
            <LoadingButton
              isLoading={toggleStatusMutation.isPending}
              onClick={() => handleToggleStatus(row.original)}
              className={`text-sm font-medium border-none bg-transparent p-0 ${
                row.original.isActive
                  ? 'text-red-600 hover:text-red-900'
                  : 'text-green-600 hover:text-green-900'
              }`}
            >
              {row.original.isActive ? 'Deactivate' : 'Activate'}
            </LoadingButton>
          </div>
        ),
      },
    ],
    enableSorting: true,
    enableFiltering: true,
  });

  const handleToggleStatus = async (user: User) => {
    try {
      await toggleStatusMutation.mutateAsync({
        userId: user.id,
        isActive: !user.isActive,
      });
    } catch {
      // Error is handled by the mutation's onError callback
    }
  };

  const handleCreateUser = () => {
    navigate({ to: '/users/create' });
  };

  // Handle error state
  if (error) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <div className='max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>
          <ErrorWithRetry
            error={error}
            onRetry={() => {
              refetch();
            }}
            title='Failed to load users'
            showErrorDetails={false}
            className='mt-20'
          />
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
            <button
              onClick={handleCreateUser}
              className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            >
              Create User
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='max-w-7xl mx-auto py-6 sm:px-6 lg:px-8'>
        <div className='px-4 py-6 sm:px-0'>
          {/* Filters */}
          <div className='bg-white p-6 rounded-lg shadow mb-6'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <label
                  htmlFor='search'
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  Search Users
                </label>
                <input
                  type='text'
                  id='search'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder='Search by name or email...'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                />
              </div>

              <div>
                <label
                  htmlFor='status'
                  className='block text-sm font-medium text-gray-700 mb-2'
                >
                  Status Filter
                </label>
                <select
                  id='status'
                  value={statusFilter}
                  onChange={e =>
                    setStatusFilter(
                      e.target.value as 'all' | 'active' | 'inactive'
                    )
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value='all'>All Users</option>
                  <option value='active'>Active Only</option>
                  <option value='inactive'>Inactive Only</option>
                </select>
              </div>

              <div className='flex items-end'>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  className='w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className='bg-white shadow overflow-hidden sm:rounded-md'>
            <div className='px-4 py-5 sm:p-6'>
              {isLoading ? (
                <SkeletonTable rows={8} columns={5} className='space-y-4' />
              ) : (
                <div className='overflow-x-auto'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                      {table.table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map(header => (
                            <th
                              key={header.id}
                              className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100'
                              onClick={header.column.getToggleSortingHandler()}
                            >
                              <div className='flex items-center space-x-1'>
                                <span>
                                  {header.isPlaceholder
                                    ? null
                                    : typeof header.column.columnDef.header ===
                                        'function'
                                      ? header.column.columnDef.header(
                                          header.getContext()
                                        )
                                      : header.column.columnDef.header}
                                </span>
                                {header.column.getIsSorted() && (
                                  <span className='text-blue-600'>
                                    {header.column.getIsSorted() === 'desc'
                                      ? '↓'
                                      : '↑'}
                                  </span>
                                )}
                              </div>
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                      {table.table.getRowModel().rows.map(row => (
                        <tr key={row.id} className='hover:bg-gray-50'>
                          {row.getVisibleCells().map(cell => (
                            <td
                              key={cell.id}
                              className='px-6 py-4 whitespace-nowrap'
                            >
                              {typeof cell.column.columnDef.cell === 'function'
                                ? cell.column.columnDef.cell(cell.getContext())
                                : cell.getValue()}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              <div className='flex items-center justify-between mt-6'>
                <div className='text-sm text-gray-700'>
                  Showing {table.table.getRowModel().rows.length} of{' '}
                  {users?.data?.length || 0} users
                </div>
                <div className='flex space-x-2'>
                  <button
                    onClick={() => table.table.previousPage()}
                    disabled={!table.table.getCanPreviousPage()}
                    className='px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => table.table.nextPage()}
                    disabled={!table.table.getCanNextPage()}
                    className='px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
