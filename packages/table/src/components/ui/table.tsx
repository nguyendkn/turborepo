import * as React from 'react';
import { cn } from '../../utils/cn';

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <table
    ref={ref}
    className={cn('w-full caption-bottom text-sm', className)}
    {...props}
  />
));
Table.displayName = 'Table';

const TableContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('relative w-full overflow-auto', className)}
    {...props}
  />
));
TableContainer.displayName = 'TableContainer';

export { Table, TableContainer };
