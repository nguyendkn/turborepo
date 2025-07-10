import type { ReactNode } from 'react';
import type { TableColumn } from './column';

/**
 * Base table configuration interface
 */
export interface BaseTableConfig<TData = unknown> {
  /** Table data array */
  data: TData[];
  /** Column definitions */
  columns: TableColumn<TData>[];
  /** Optional CSS class name */
  className?: string;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: ReactNode;
}

/**
 * Infinite table specific configuration
 */
export interface InfiniteTableConfig<TData = unknown> extends BaseTableConfig<TData> {
  /** Function to fetch next page */
  fetchNextPage?: () => void;
  /** Whether there are more pages to load */
  hasNextPage?: boolean;
  /** Loading state for next page */
  isFetchingNextPage?: boolean;
}

/**
 * Virtualized table specific configuration
 */
export interface VirtualizedTableConfig<TData = unknown> extends InfiniteTableConfig<TData> {
  /** Estimated row height for virtualization */
  estimateSize?: number;
  /** Number of items to render outside visible area */
  overscan?: number;
  /** Container height for virtualization */
  height?: number;
}

/**
 * Table state interface
 */
export interface TableState {
  /** Current page index */
  pageIndex: number;
  /** Page size */
  pageSize: number;
  /** Sorting state */
  sorting: Array<{
    id: string;
    desc: boolean;
  }>;
  /** Column filters */
  columnFilters: Array<{
    id: string;
    value: unknown;
  }>;
  /** Global filter */
  globalFilter: string;
  /** Column visibility */
  columnVisibility: Record<string, boolean>;
  /** Column order */
  columnOrder: string[];
  /** Column sizing */
  columnSizing: Record<string, number>;
}

/**
 * Table event handlers
 */
export interface TableEventHandlers<TData = unknown> {
  /** Row click handler */
  onRowClick?: (row: TData, index: number) => void;
  /** Row double click handler */
  onRowDoubleClick?: (row: TData, index: number) => void;
  /** Cell click handler */
  onCellClick?: (value: unknown, row: TData, column: string) => void;
  /** Selection change handler */
  onSelectionChange?: (selectedRows: TData[]) => void;
  /** Sort change handler */
  onSortChange?: (sorting: TableState['sorting']) => void;
  /** Filter change handler */
  onFilterChange?: (filters: TableState['columnFilters']) => void;
}
