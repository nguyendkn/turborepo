/**
 * Table Management Hook
 * Custom hook for table handling using TanStack Table
 */

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
} from '@tanstack/react-table';
import { useState, useMemo } from 'react';

import type { TableState } from '@/types';

/**
 * Table configuration options
 */
interface UseTableOptions<T> {
  data: T[];
  columns: ColumnDef<T>[];
  initialPageSize?: number;
  initialSorting?: SortingState;
  initialFilters?: ColumnFiltersState;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  enablePagination?: boolean;
  enableRowSelection?: boolean;
  enableMultiRowSelection?: boolean;
  onRowSelectionChange?: (selectedRows: T[]) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onFiltersChange?: (filters: ColumnFiltersState) => void;
  onPaginationChange?: (pagination: PaginationState) => void;
}

/**
 * Enhanced table hook with sorting, filtering, and pagination
 */
export const useTable = <T>({
  data,
  columns,
  initialPageSize = 10,
  initialSorting = [],
  initialFilters = [],
  enableSorting = true,
  enableFiltering = true,
  enablePagination = true,
  enableRowSelection = false,
  enableMultiRowSelection = true,
  onRowSelectionChange,
  onSortingChange,
  onFiltersChange,
  onPaginationChange,
}: UseTableOptions<T>) => {
  // Table state
  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] =
    useState<ColumnFiltersState>(initialFilters);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState('');

  // Memoized data to prevent unnecessary re-renders
  const memoizedData = useMemo(() => data, [data]);
  const memoizedColumns = useMemo(() => columns, [columns]);

  // Table instance
  const table = useReactTable({
    data: memoizedData,
    columns: memoizedColumns,
    state: {
      sorting,
      columnFilters,
      pagination,
      rowSelection,
      globalFilter,
    },
    onSortingChange: updater => {
      setSorting(updater);
      if (onSortingChange) {
        const newSorting =
          typeof updater === 'function' ? updater(sorting) : updater;
        onSortingChange(newSorting);
      }
    },
    onColumnFiltersChange: updater => {
      setColumnFilters(updater);
      if (onFiltersChange) {
        const newFilters =
          typeof updater === 'function' ? updater(columnFilters) : updater;
        onFiltersChange(newFilters);
      }
    },
    onPaginationChange: updater => {
      setPagination(updater);
      if (onPaginationChange) {
        const newPagination =
          typeof updater === 'function' ? updater(pagination) : updater;
        onPaginationChange(newPagination);
      }
    },
    onRowSelectionChange: updater => {
      setRowSelection(updater);
      if (onRowSelectionChange) {
        const newSelection =
          typeof updater === 'function' ? updater(rowSelection) : updater;
        const selectedRows = Object.keys(newSelection)
          .filter(key => newSelection[key])
          .map(key => memoizedData[parseInt(key)])
          .filter(Boolean);
        onRowSelectionChange(selectedRows);
      }
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    getPaginationRowModel: enablePagination
      ? getPaginationRowModel()
      : undefined,
    enableRowSelection,
    enableMultiRowSelection,
    enableSorting,
    enableColumnFilters: enableFiltering,
    enableGlobalFilter: enableFiltering,
  });

  /**
   * Get table state summary
   */
  const getTableState = (): TableState<T> => ({
    data: memoizedData,
    pagination: {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      total: memoizedData.length,
      totalPages: Math.ceil(memoizedData.length / pagination.pageSize),
    },
    sorting: {
      field: sorting[0]?.id || '',
      direction: sorting[0]?.desc ? 'desc' : 'asc',
    },
    filters: columnFilters.reduce(
      (acc, filter) => {
        acc[filter.id] = filter.value;
        return acc;
      },
      {} as Record<string, unknown>
    ),
    isLoading: false,
    error: null,
  });

  /**
   * Get selected rows
   */
  const getSelectedRows = (): T[] => {
    return Object.keys(rowSelection)
      .filter(key => rowSelection[key])
      .map(key => memoizedData[parseInt(key)])
      .filter(Boolean);
  };

  /**
   * Clear all selections
   */
  const clearSelection = () => {
    setRowSelection({});
  };

  /**
   * Select all rows
   */
  const selectAll = () => {
    const allSelected = memoizedData.reduce((acc, _, index) => {
      acc[index] = true;
      return acc;
    }, {} as RowSelectionState);
    setRowSelection(allSelected);
  };

  /**
   * Reset table state
   */
  const resetTable = () => {
    setSorting(initialSorting);
    setColumnFilters(initialFilters);
    setPagination({
      pageIndex: 0,
      pageSize: initialPageSize,
    });
    setRowSelection({});
    setGlobalFilter('');
  };

  /**
   * Set page size
   */
  const setPageSize = (size: number) => {
    setPagination(prev => ({
      ...prev,
      pageSize: size,
      pageIndex: 0, // Reset to first page
    }));
  };

  /**
   * Go to specific page
   */
  const goToPage = (pageIndex: number) => {
    setPagination(prev => ({
      ...prev,
      pageIndex,
    }));
  };

  /**
   * Set global search filter
   */
  const setSearch = (search: string) => {
    setGlobalFilter(search);
  };

  /**
   * Set column filter
   */
  const setColumnFilter = (columnId: string, value: unknown) => {
    setColumnFilters(prev => {
      const existing = prev.find(filter => filter.id === columnId);
      if (existing) {
        return prev.map(filter =>
          filter.id === columnId ? { ...filter, value } : filter
        );
      }
      return [...prev, { id: columnId, value }];
    });
  };

  /**
   * Clear column filter
   */
  const clearColumnFilter = (columnId: string) => {
    setColumnFilters(prev => prev.filter(filter => filter.id !== columnId));
  };

  /**
   * Clear all filters
   */
  const clearAllFilters = () => {
    setColumnFilters([]);
    setGlobalFilter('');
  };

  return {
    table,
    tableState: getTableState(),

    // Selection methods
    selectedRows: getSelectedRows(),
    clearSelection,
    selectAll,

    // Pagination methods
    setPageSize,
    goToPage,

    // Filter methods
    setSearch,
    setColumnFilter,
    clearColumnFilter,
    clearAllFilters,

    // Utility methods
    resetTable,

    // State getters
    hasSelection: Object.keys(rowSelection).length > 0,
    selectedCount: Object.keys(rowSelection).filter(key => rowSelection[key])
      .length,
    totalRows: memoizedData.length,
    currentPage: pagination.pageIndex + 1,
    totalPages: Math.ceil(memoizedData.length / pagination.pageSize),

    // Direct state access
    sorting,
    columnFilters,
    pagination,
    rowSelection,
    globalFilter,
  };
};
