/**
 * Policies Management Page
 * Main page for policy listing, filtering, and management
 */

import { useNavigate } from '@tanstack/react-router';
import React, { useState } from 'react';

import { ProtectedRoute } from '@/components/auth/protected-route';
import {
  usePolicies,
  useDeletePolicy,
  useTogglePolicyStatus,
} from '@/hooks/api/use-policies-api';
import { useTable } from '@/hooks/ui/use-table';
import type { Policy } from '@/types';

export const PoliciesPage: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all');
  const [effectFilter, setEffectFilter] = useState<'all' | 'allow' | 'deny'>(
    'all'
  );

  // API hooks
  const {
    data: policies,
    isLoading,
    error,
  } = usePolicies({
    includeInactive: statusFilter !== 'active',
    effect:
      effectFilter === 'all' ? undefined : (effectFilter as 'allow' | 'deny'),
  });
  const deletePolicyMutation = useDeletePolicy();
  const toggleStatusMutation = useTogglePolicyStatus();

  // Table configuration
  const table = useTable<Policy>({
    data: policies?.policies || [],
    columns: [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type='checkbox'
            checked={table.getIsAllPageRowsSelected()}
            onChange={e => table.toggleAllPageRowsSelected(e.target.checked)}
            className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
          />
        ),
        cell: ({ row }) => (
          <input
            type='checkbox'
            checked={row.getIsSelected()}
            onChange={e => row.toggleSelected(e.target.checked)}
            className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'name',
        header: 'Policy Name',
        cell: ({ row }) => (
          <div>
            <div className='font-medium text-gray-900'>{row.original.name}</div>
            {row.original.description && (
              <div className='text-sm text-gray-500'>
                {row.original.description}
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'effect',
        header: 'Effect',
        cell: ({ row }) => (
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              row.original.effect === 'allow'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {row.original.effect.toUpperCase()}
          </span>
        ),
      },
      {
        accessorKey: 'priority',
        header: 'Priority',
        cell: ({ row }) => (
          <div className='text-sm text-gray-900'>{row.original.priority}</div>
        ),
      },
      {
        accessorKey: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className='text-sm text-gray-900'>
            <div className='flex flex-wrap gap-1'>
              {row.original.actions.slice(0, 3).map((action, index) => (
                <span
                  key={index}
                  className='inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded'
                >
                  {action}
                </span>
              ))}
              {row.original.actions.length > 3 && (
                <span className='text-xs text-gray-500'>
                  +{row.original.actions.length - 3} more
                </span>
              )}
            </div>
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'resources',
        header: 'Resources',
        cell: ({ row }) => (
          <div className='text-sm text-gray-900'>
            <div className='flex flex-wrap gap-1'>
              {row.original.resources.slice(0, 3).map((resource, index) => (
                <span
                  key={index}
                  className='inline-flex px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded'
                >
                  {resource}
                </span>
              ))}
              {row.original.resources.length > 3 && (
                <span className='text-xs text-gray-500'>
                  +{row.original.resources.length - 3} more
                </span>
              )}
            </div>
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'isActive',
        header: 'Status',
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
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => (
          <div className='text-sm text-gray-900'>
            {new Date(row.original.createdAt).toLocaleDateString()}
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className='flex space-x-2'>
            <button
              onClick={() =>
                navigate({ to: `/policies/${row.original.id}/edit` })
              }
              className='text-blue-600 hover:text-blue-900 text-sm font-medium'
            >
              Edit
            </button>
            <button
              onClick={() => handleToggleStatus(row.original)}
              className='text-yellow-600 hover:text-yellow-900 text-sm font-medium'
            >
              {row.original.isActive ? 'Deactivate' : 'Activate'}
            </button>
            <button
              onClick={() => handleDeletePolicy(row.original.id)}
              className='text-red-600 hover:text-red-900 text-sm font-medium'
            >
              Delete
            </button>
          </div>
        ),
        enableSorting: false,
      },
    ],
    enableRowSelection: true,
    enableSorting: true,
    enableFiltering: true,
  });

  const handleDeletePolicy = async (policyId: string) => {
    if (
      window.confirm(
        'Are you sure you want to delete this policy? This action cannot be undone.'
      )
    ) {
      try {
        await deletePolicyMutation.mutateAsync(policyId);
      } catch {
        // Error is handled by the mutation's onError callback
      }
    }
  };

  const handleToggleStatus = async (policy: Policy) => {
    try {
      await toggleStatusMutation.mutateAsync({
        policyId: policy.id,
        statusData: { isActive: !policy.isActive },
      });
    } catch {
      // Error is handled by the mutation's onError callback
    }
  };

  const handleCreatePolicy = () => {
    navigate({ to: '/policies/create' });
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredPermissions={['policies:read']}>
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600'></div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requiredPermissions={['policies:read']}>
        <div className='text-center py-12'>
          <div className='text-red-600 text-lg font-medium'>
            Error loading policies
          </div>
          <div className='text-gray-500 mt-2'>Please try again later</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredPermissions={['policies:read']}>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex justify-between items-center'>
          <h1 className='text-3xl font-bold text-gray-900'>
            Policy Management
          </h1>
          <ProtectedRoute requiredPermissions={['policies:create']}>
            <button
              onClick={handleCreatePolicy}
              className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            >
              Create Policy
            </button>
          </ProtectedRoute>
        </div>

        {/* Filters */}
        <div className='bg-white p-6 rounded-lg shadow'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
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
                <option value='all'>All Policies</option>
                <option value='active'>Active Only</option>
                <option value='inactive'>Inactive Only</option>
              </select>
            </div>
            <div>
              <label
                htmlFor='effect'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Effect Filter
              </label>
              <select
                id='effect'
                value={effectFilter}
                onChange={e =>
                  setEffectFilter(e.target.value as 'all' | 'allow' | 'deny')
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
              >
                <option value='all'>All Effects</option>
                <option value='allow'>Allow Only</option>
                <option value='deny'>Deny Only</option>
              </select>
            </div>
            <div className='md:col-span-2 flex items-end'>
              <div className='text-sm text-gray-600'>
                Showing {policies?.policies?.length || 0} of{' '}
                {policies?.pagination?.total || 0} policies
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className='bg-white shadow rounded-lg overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                {table.table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                      >
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
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {table.table.getRowModel().rows.map(row => (
                  <tr key={row.id} className='hover:bg-gray-50'>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className='px-6 py-4 whitespace-nowrap'>
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

          {/* Pagination */}
          {policies?.pagination && (
            <div className='bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6'>
              <div className='flex-1 flex justify-between sm:hidden'>
                <button
                  onClick={() => table.table.previousPage()}
                  disabled={!table.table.getCanPreviousPage()}
                  className='relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Previous
                </button>
                <button
                  onClick={() => table.table.nextPage()}
                  disabled={!table.table.getCanNextPage()}
                  className='ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};
