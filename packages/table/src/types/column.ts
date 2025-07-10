import type { ReactNode } from 'react';

/**
 * Column configuration interface
 */
export interface TableColumn<TData = unknown> {
  /** Unique column identifier */
  id: string;
  /** Column display name */
  name: string;
  /** Column accessor key or function */
  accessor?: keyof TData | ((row: TData) => unknown);
  /** Column header content */
  header?: ReactNode | ((props: { column: TableColumn<TData> }) => ReactNode);
  /** Cell renderer */
  cell?: ReactNode | ((props: { value: unknown; row: TData; column: TableColumn<TData> }) => ReactNode);
  /** Column width */
  width?: number;
  /** Minimum column width */
  minWidth?: number;
  /** Maximum column width */
  maxWidth?: number;
  /** Whether column is resizable */
  resizable?: boolean;
  /** Whether column is sortable */
  sortable?: boolean;
  /** Whether column is filterable */
  filterable?: boolean;
  /** Whether column is visible */
  visible?: boolean;
  /** Whether column is pinned */
  pinned?: 'left' | 'right' | false;
  /** Column description */
  description?: string;
  /** Column icon */
  icon?: ReactNode;
  /** Whether column is primary */
  isPrimary?: boolean;
  /** Whether column is readonly */
  readonly?: boolean;
  /** Custom CSS class for column */
  className?: string;
  /** Custom CSS class for header */
  headerClassName?: string;
  /** Custom CSS class for cells */
  cellClassName?: string;
}

/**
 * Column statistics interface
 */
export interface ColumnStatistic {
  /** Total value */
  total: string;
  /** Additional statistics */
  [key: string]: string;
}

/**
 * Column statistics map
 */
export interface ColumnStatistics {
  [columnId: string]: ColumnStatistic | null;
}

/**
 * Column resize state
 */
export interface ColumnResizeState {
  /** Column index being resized */
  columnIndex: number;
  /** New width */
  width: number;
  /** X position */
  x: number;
}

/**
 * Column freeze state
 */
export interface ColumnFreezeState {
  /** Source column index */
  sourceIndex: number;
  /** Target column index */
  targetIndex: number;
  /** Whether currently freezing */
  isFreezing: boolean;
}

/**
 * Column loading state
 */
export interface ColumnLoading {
  /** Column ID */
  columnId: string;
  /** Loading state */
  loading: boolean;
}
