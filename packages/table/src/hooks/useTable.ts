import { useReactTable, getCoreRowModel } from '@tanstack/react-table';
import type { ColumnDef, TableOptions } from '@tanstack/react-table';

/**
 * Hook for basic table functionality
 */
export function useTable<TData>(options: TableOptions<TData>) {
  return useReactTable({
    ...options,
    getCoreRowModel: options.getCoreRowModel || getCoreRowModel(),
  });
}

/**
 * Hook for table with default configuration
 */
export function useBasicTable<TData>(
  data: TData[],
  columns: ColumnDef<TData>[],
  options?: Partial<TableOptions<TData>>
) {
  return useTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    ...options,
  });
}
