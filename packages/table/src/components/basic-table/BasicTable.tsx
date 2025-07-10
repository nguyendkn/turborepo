import React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { cn } from '../../utils/cn';
import type { BaseTableConfig, TableEventHandlers } from '../../types/table';
import type { TableColumn } from '../../types/column';
import { Table, TableContainer } from '../ui/table';
import { TableHeader } from '../ui/table-header';
import { TableBody } from '../ui/table-body';
import { TableRow } from '../ui/table-row';
import { TableCell, TableHead } from '../ui/table-cell';

/**
 * Convert TableColumn to TanStack ColumnDef
 */
function convertToColumnDef<TData>(col: TableColumn<TData>): ColumnDef<TData> {
  const baseColumnDef = {
    id: col.id,
    size: col.width,
    minSize: col.minWidth,
    maxSize: col.maxWidth,
    enableSorting: col.sortable,
    enableResizing: col.resizable,
  };

  // Create column def with proper typing based on accessor type
  if (typeof col.accessor === 'string') {
    return {
      ...baseColumnDef,
      accessorKey: col.accessor as keyof TData,
      header: col.header || col.name,
      cell: col.cell ? ({ getValue, row }) => {
        if (typeof col.cell === 'function') {
          return col.cell({
            value: getValue(),
            row: row.original,
            column: col,
          });
        }
        return col.cell;
      } : undefined,
    } as ColumnDef<TData>;
  } else if (typeof col.accessor === 'function') {
    return {
      ...baseColumnDef,
      accessorFn: col.accessor,
      header: col.header || col.name,
      cell: col.cell ? ({ getValue, row }) => {
        if (typeof col.cell === 'function') {
          return col.cell({
            value: getValue(),
            row: row.original,
            column: col,
          });
        }
        return col.cell;
      } : undefined,
    } as ColumnDef<TData>;
  } else {
    return {
      ...baseColumnDef,
      header: col.header || col.name,
      cell: col.cell ? ({ getValue, row }) => {
        if (typeof col.cell === 'function') {
          return col.cell({
            value: getValue(),
            row: row.original,
            column: col,
          });
        }
        return col.cell;
      } : undefined,
    } as ColumnDef<TData>;
  }
}

export interface BasicTableProps<TData = unknown>
  extends BaseTableConfig<TData>,
    Partial<TableEventHandlers<TData>> {
  /** Additional CSS class name */
  className?: string;
  /** Custom row key extractor */
  getRowId?: (row: TData, index: number) => string;
  /** Custom empty state component */
  emptyComponent?: React.ReactNode;
  /** Show loading state */
  loading?: boolean;
  /** Loading component */
  loadingComponent?: React.ReactNode;
}

/**
 * BasicTable - A simple table component for displaying tabular data
 *
 * Features:
 * - Basic table rendering with rows and columns
 * - Custom cell renderers
 * - Row and cell click handlers
 * - Loading and empty states
 * - Responsive design
 */
export function BasicTable<TData = unknown>({
  data,
  columns,
  className,
  emptyMessage = 'No data available',
  emptyComponent,
  loading = false,
  loadingComponent,
  getRowId,
  onRowClick,
  onRowDoubleClick,
  onCellClick,
  ...props
}: BasicTableProps<TData>) {
  // Convert our column format to TanStack Table format
  const tableColumns: ColumnDef<TData>[] = React.useMemo(() => {
    return columns.map(col => convertToColumnDef(col));
  }, [columns]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: getRowId ? (row, index) => getRowId(row, index) : undefined,
  });

  const handleRowClick = React.useCallback(
    (row: TData, index: number) => {
      onRowClick?.(row, index);
    },
    [onRowClick]
  );

  const handleRowDoubleClick = React.useCallback(
    (row: TData, index: number) => {
      onRowDoubleClick?.(row, index);
    },
    [onRowDoubleClick]
  );

  const handleCellClick = React.useCallback(
    (value: unknown, row: TData, columnId: string) => {
      onCellClick?.(value, row, columnId);
    },
    [onCellClick]
  );

  // Loading state
  if (loading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    return (
      <TableContainer
        className={cn('flex items-center justify-center p-8', className)}
      >
        <div className='text-muted-foreground'>Loading...</div>
      </TableContainer>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    if (emptyComponent) {
      return <>{emptyComponent}</>;
    }
    return (
      <TableContainer
        className={cn('flex items-center justify-center p-8', className)}
      >
        <div className='text-muted-foreground'>{emptyMessage}</div>
      </TableContainer>
    );
  }

  return (
    <TableContainer className={className} {...props}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead
                  key={header.id}
                  style={{
                    width:
                      header.getSize() !== 150 ? header.getSize() : undefined,
                    minWidth: header.column.columnDef.minSize,
                    maxWidth: header.column.columnDef.maxSize,
                  }}
                >
                  {header.isPlaceholder
                    ? null
                    : (flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      ) as React.ReactNode)}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row, index) => (
            <TableRow
              key={row.id}
              onClick={() => handleRowClick(row.original, index)}
              onDoubleClick={() => handleRowDoubleClick(row.original, index)}
              className={cn(
                onRowClick && 'cursor-pointer',
                'hover:bg-muted/50'
              )}
            >
              {row.getVisibleCells().map(cell => (
                <TableCell
                  key={cell.id}
                  onClick={event => {
                    event.stopPropagation();
                    handleCellClick(
                      cell.getValue(),
                      row.original,
                      cell.column.id
                    );
                  }}
                  className={cn(onCellClick && 'cursor-pointer')}
                  style={{
                    width:
                      cell.column.getSize() !== 150
                        ? cell.column.getSize()
                        : undefined,
                    minWidth: cell.column.columnDef.minSize,
                    maxWidth: cell.column.columnDef.maxSize,
                  }}
                >
                  {
                    flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    ) as React.ReactNode
                  }
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
