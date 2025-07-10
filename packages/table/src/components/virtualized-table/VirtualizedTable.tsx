import React, { useCallback, useRef } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cn } from '../../utils/cn';
import type { VirtualizedTableConfig, TableEventHandlers } from '../../types/table';
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

export interface VirtualizedTableProps<TData = unknown>
  extends VirtualizedTableConfig<TData>,
          Partial<TableEventHandlers<TData>> {
  /** Additional CSS class name */
  className?: string;
  /** Custom row key extractor */
  getRowId?: (row: TData, index: number) => string;
  /** Custom empty state component */
  emptyComponent?: React.ReactNode;
  /** Loading component */
  loadingComponent?: React.ReactNode;
  /** Threshold for triggering next page load (pixels from bottom) */
  threshold?: number;
}

/**
 * VirtualizedTable - A table component with row virtualization for performance
 *
 * Features:
 * - Row virtualization for large datasets using @tanstack/react-virtual
 * - All InfiniteTable features
 * - Configurable overscan and estimated row size
 * - High performance for thousands of rows
 */
export function VirtualizedTable<TData = unknown>({
  data,
  columns,
  className,
  emptyMessage = 'No data available',
  emptyComponent,
  loading = false,
  loadingComponent,
  fetchNextPage,
  hasNextPage = false,
  isFetchingNextPage = false,
  estimateSize = 40,
  overscan = 5,
  height = 400,
  threshold = 100,
  getRowId,
  onRowClick,
  onRowDoubleClick,
  onCellClick,
  ...props
}: VirtualizedTableProps<TData>) {
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Virtualization
  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => containerRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  // Infinite scroll logic
  const fetchMoreOnBottomReached = useCallback(
    (containerElement?: HTMLDivElement | null) => {
      if (!containerElement || !fetchNextPage || !hasNextPage || isFetchingNextPage) {
        return;
      }

      const { scrollHeight, scrollTop, clientHeight } = containerElement;
      const isReachedThreshold = scrollHeight - scrollTop - clientHeight < threshold;

      if (isReachedThreshold) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage, threshold]
  );

  // Check for initial load and scroll events
  React.useEffect(() => {
    fetchMoreOnBottomReached(containerRef.current);
  }, [fetchMoreOnBottomReached]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    fetchMoreOnBottomReached(event.target as HTMLDivElement);
  }, [fetchMoreOnBottomReached]);

  const handleRowClick = React.useCallback((row: TData, index: number) => {
    onRowClick?.(row, index);
  }, [onRowClick]);

  const handleRowDoubleClick = React.useCallback((row: TData, index: number) => {
    onRowDoubleClick?.(row, index);
  }, [onRowDoubleClick]);

  const handleCellClick = React.useCallback((value: unknown, row: TData, columnId: string) => {
    onCellClick?.(value, row, columnId);
  }, [onCellClick]);

  // Loading state
  if (loading && data.length === 0) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    return (
      <TableContainer className={cn('flex items-center justify-center p-8', className)}>
        <div className="text-muted-foreground">Loading...</div>
      </TableContainer>
    );
  }

  // Empty state
  if (!loading && (!data || data.length === 0)) {
    if (emptyComponent) {
      return <>{emptyComponent}</>;
    }
    return (
      <TableContainer className={cn('flex items-center justify-center p-8', className)}>
        <div className="text-muted-foreground">{emptyMessage}</div>
      </TableContainer>
    );
  }

  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  return (
    <TableContainer
      ref={containerRef}
      className={cn('relative overflow-auto', className)}
      style={{ height }}
      onScroll={handleScroll}
      {...props}
    >
      <Table className="relative">
        {/* Sticky Header */}
        <TableHeader className="sticky top-0 z-10 bg-background">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              key={headerGroup.id}
              className="bg-background hover:bg-background"
            >
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="bg-background"
                  style={{
                    width: header.getSize() !== 150 ? header.getSize() : undefined,
                    minWidth: header.column.columnDef.minSize,
                    maxWidth: header.column.columnDef.maxSize,
                  }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext()) as React.ReactNode}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        {/* Virtualized Body */}
        <TableBody>
          {/* Virtual spacer before visible items */}
          {virtualItems.length > 0 && (
            <tr>
              <td colSpan={columns.length} style={{ height: virtualItems[0]?.start || 0 }} />
            </tr>
          )}

          {/* Render visible rows */}
          {virtualItems.map((virtualItem) => {
            const row = table.getRowModel().rows[virtualItem.index];
            if (!row) return null;

            return (
              <TableRow
                key={row.id}
                onClick={() => handleRowClick(row.original, virtualItem.index)}
                onDoubleClick={() => handleRowDoubleClick(row.original, virtualItem.index)}
                className={cn(
                  onRowClick && 'cursor-pointer',
                  'hover:bg-muted/50'
                )}
                style={{
                  height: virtualItem.size,
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleCellClick(
                        cell.getValue(),
                        row.original,
                        cell.column.id
                      );
                    }}
                    className={cn(
                      onCellClick && 'cursor-pointer'
                    )}
                    style={{
                      width: cell.column.getSize() !== 150 ? cell.column.getSize() : undefined,
                      minWidth: cell.column.columnDef.minSize,
                      maxWidth: cell.column.columnDef.maxSize,
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext()) as React.ReactNode}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}

          {/* Virtual spacer after visible items */}
          {virtualItems.length > 0 && (
            <tr>
              <td
                colSpan={columns.length}
                style={{
                  height: totalSize - (virtualItems[virtualItems.length - 1]?.end || 0)
                }}
              />
            </tr>
          )}

          {/* Loading indicator for next page */}
          {isFetchingNextPage && (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-16 text-center text-muted-foreground"
              >
                Loading more...
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
