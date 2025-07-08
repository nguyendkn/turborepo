/**
 * Table Component
 * Reusable table component with TanStack Table integration
 */

import { flexRender, type Table as TanStackTable } from '@tanstack/react-table';
import React from 'react';

import { Button } from './button';
import { SkeletonTable } from './loading-spinner';

/**
 * Base Table Components
 */
export interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className = '' }) => (
  <div className='overflow-x-auto'>
    <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
      {children}
    </table>
  </div>
);

export const TableHeader: React.FC<TableProps> = ({
  children,
  className = '',
}) => <thead className={`bg-gray-50 ${className}`}>{children}</thead>;

export const TableBody: React.FC<TableProps> = ({
  children,
  className = '',
}) => (
  <tbody className={`bg-white divide-y divide-gray-200 ${className}`}>
    {children}
  </tbody>
);

export const TableRow: React.FC<TableProps> = ({
  children,
  className = '',
}) => <tr className={`hover:bg-gray-50 ${className}`}>{children}</tr>;

export interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  as?: 'td' | 'th';
}

export const TableCell: React.FC<TableCellProps> = ({
  children,
  className = '',
  as: Component = 'td',
}) => (
  <Component className={`px-6 py-4 whitespace-nowrap text-sm ${className}`}>
    {children}
  </Component>
);

export const TableHeaderCell: React.FC<Omit<TableCellProps, 'as'>> = ({
  children,
  className = '',
}) => (
  <TableCell
    as='th'
    className={`font-medium text-gray-900 text-left ${className}`}
  >
    {children}
  </TableCell>
);

/**
 * Data Table Component with TanStack Table
 */
export interface DataTableProps<T> {
  table: TanStackTable<T>;
  isLoading?: boolean;
  error?: string;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T>({
  table,
  isLoading = false,
  error,
  emptyMessage = 'No data available',
  className = '',
}: DataTableProps<T>) {
  if (isLoading) {
    return <SkeletonTable rows={5} columns={table.getAllColumns().length} />;
  }

  if (error) {
    return (
      <div className='text-center py-8'>
        <p className='text-red-600'>{error}</p>
      </div>
    );
  }

  const rows = table.getRowModel().rows;

  return (
    <Table className={className}>
      <TableHeader>
        {table.getHeaderGroups().map(headerGroup => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map(header => (
              <TableHeaderCell key={header.id}>
                {header.isPlaceholder ? null : (
                  <div
                    className={
                      header.column.getCanSort()
                        ? 'cursor-pointer select-none flex items-center space-x-1'
                        : ''
                    }
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {header.column.getCanSort() && (
                      <span className='ml-1'>
                        {{
                          asc: '↑',
                          desc: '↓',
                        }[header.column.getIsSorted() as string] ?? '↕'}
                      </span>
                    )}
                  </div>
                )}
              </TableHeaderCell>
            ))}
          </TableRow>
        ))}
      </TableHeader>

      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell className='text-center py-8 text-gray-500'>
              <div style={{ gridColumn: `1 / -1` }}>{emptyMessage}</div>
            </TableCell>
          </TableRow>
        ) : (
          rows.map(row => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}

/**
 * Table Pagination Component
 */
export interface TablePaginationProps<T> {
  table: TanStackTable<T>;
  className?: string;
}

export function TablePagination<T>({
  table,
  className = '',
}: TablePaginationProps<T>) {
  return (
    <div
      className={`flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200 ${className}`}
    >
      <div className='flex items-center text-sm text-gray-700'>
        <span>
          Showing{' '}
          {table.getState().pagination.pageIndex *
            table.getState().pagination.pageSize +
            1}{' '}
          to{' '}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) *
              table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{' '}
          of {table.getFilteredRowModel().rows.length} results
        </span>
      </div>

      <div className='flex items-center space-x-2'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          First
        </Button>

        <Button
          variant='ghost'
          size='sm'
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>

        <span className='text-sm text-gray-700'>
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </span>

        <Button
          variant='ghost'
          size='sm'
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>

        <Button
          variant='ghost'
          size='sm'
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          Last
        </Button>
      </div>
    </div>
  );
}

/**
 * Table Search Component
 */
export interface TableSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const TableSearch: React.FC<TableSearchProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
}) => (
  <div className={`relative ${className}`}>
    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
      <svg
        className='h-5 w-5 text-gray-400'
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
        />
      </svg>
    </div>
    <input
      type='text'
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
    />
  </div>
);

/**
 * Table Actions Component
 */
export interface TableActionsProps {
  children: React.ReactNode;
  className?: string;
}

export const TableActions: React.FC<TableActionsProps> = ({
  children,
  className = '',
}) => (
  <div className={`flex items-center space-x-2 ${className}`}>{children}</div>
);

/**
 * Table Container Component
 */
export interface TableContainerProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const TableContainer: React.FC<TableContainerProps> = ({
  children,
  title,
  description,
  actions,
  className = '',
}) => (
  <div className={`bg-white shadow rounded-lg ${className}`}>
    {(title || description || actions) && (
      <div className='px-6 py-4 border-b border-gray-200'>
        <div className='flex items-center justify-between'>
          <div>
            {title && (
              <h3 className='text-lg font-medium text-gray-900'>{title}</h3>
            )}
            {description && (
              <p className='mt-1 text-sm text-gray-500'>{description}</p>
            )}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      </div>
    )}
    {children}
  </div>
);
