import type { BaseTableConfig, InfiniteTableConfig, VirtualizedTableConfig } from '../types/table';
import type { TableColumn } from '../types/column';
import type { RowConfig } from '../types/row';
import type { SelectionState } from '../types/selection';
import type { ScrollState } from '../types/interaction';
import { TABLE_DEFAULTS } from './constants';
import { defaultThemeConfig } from './theme';

/**
 * Default table configuration
 */
export const defaultTableConfig: BaseTableConfig = {
  data: [],
  columns: [],
  loading: false,
  emptyMessage: 'No data available',
};

/**
 * Default infinite table configuration
 */
export const defaultInfiniteTableConfig: InfiniteTableConfig = {
  ...defaultTableConfig,
  hasNextPage: false,
  isFetchingNextPage: false,
};

/**
 * Default virtualized table configuration
 */
export const defaultVirtualizedTableConfig: VirtualizedTableConfig = {
  ...defaultInfiniteTableConfig,
  estimateSize: TABLE_DEFAULTS.estimatedRowHeight,
  overscan: TABLE_DEFAULTS.overscan,
  height: 400,
};

/**
 * Default column configuration
 */
export const defaultColumnConfig: Partial<TableColumn> = {
  width: TABLE_DEFAULTS.defaultColumnWidth,
  minWidth: TABLE_DEFAULTS.minColumnWidth,
  maxWidth: TABLE_DEFAULTS.maxColumnWidth,
  resizable: true,
  sortable: true,
  filterable: true,
  visible: true,
  pinned: false,
  readonly: false,
  isPrimary: false,
};

/**
 * Default row configuration
 */
export const defaultRowConfig: RowConfig = {
  height: TABLE_DEFAULTS.rowHeight,
  controls: [],
  selectable: true,
  expandable: false,
  draggable: false,
};

/**
 * Default selection state
 */
export const defaultSelectionState: SelectionState = {
  selection: null,
  activeCell: null,
  multiSelect: true,
  anchor: null,
};

/**
 * Default scroll state
 */
export const defaultScrollState: ScrollState = {
  scrollTop: 0,
  scrollLeft: 0,
  isScrolling: false,
};

/**
 * Create default column
 */
export const createDefaultColumn = (
  id: string,
  name: string,
  overrides?: Partial<TableColumn>
): TableColumn => ({
  id,
  name,
  ...defaultColumnConfig,
  ...overrides,
});

/**
 * Create default table configuration
 */
export const createDefaultTableConfig = <TData = unknown>(
  data: TData[],
  columns: TableColumn<TData>[],
  overrides?: Partial<BaseTableConfig<TData>>
): BaseTableConfig<TData> => ({
  ...defaultTableConfig,
  data,
  columns,
  ...overrides,
});

/**
 * Create default infinite table configuration
 */
export const createDefaultInfiniteTableConfig = <TData = unknown>(
  data: TData[],
  columns: TableColumn<TData>[],
  overrides?: Partial<InfiniteTableConfig<TData>>
): InfiniteTableConfig<TData> => ({
  ...defaultInfiniteTableConfig,
  data,
  columns,
  ...overrides,
});

/**
 * Create default virtualized table configuration
 */
export const createDefaultVirtualizedTableConfig = <TData = unknown>(
  data: TData[],
  columns: TableColumn<TData>[],
  overrides?: Partial<VirtualizedTableConfig<TData>>
): VirtualizedTableConfig<TData> => ({
  ...defaultVirtualizedTableConfig,
  data,
  columns,
  ...overrides,
});

/**
 * Merge configurations with defaults
 */
export const mergeWithDefaults = <T extends Record<string, unknown>>(
  config: Partial<T>,
  defaults: T
): T => {
  const merged = { ...defaults };

  Object.keys(config).forEach(key => {
    const value = config[key];
    if (value !== undefined) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const defaultValue = defaults[key];
        if (typeof defaultValue === 'object' && defaultValue !== null && !Array.isArray(defaultValue)) {
          (merged as Record<string, unknown>)[key] = { ...defaultValue, ...value };
        } else {
          (merged as Record<string, unknown>)[key] = value;
        }
      } else {
        (merged as Record<string, unknown>)[key] = value;
      }
    }
  });

  return merged;
};

/**
 * Validate table configuration
 */
export const validateTableConfig = <TData = unknown>(
  config: BaseTableConfig<TData>
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Validate data
  if (!Array.isArray(config.data)) {
    errors.push('Data must be an array');
  }
  
  // Validate columns
  if (!Array.isArray(config.columns)) {
    errors.push('Columns must be an array');
  } else if (config.columns.length === 0) {
    errors.push('At least one column is required');
  } else {
    // Validate column IDs are unique
    const columnIds = config.columns.map(col => col.id);
    const uniqueIds = new Set(columnIds);
    if (columnIds.length !== uniqueIds.size) {
      errors.push('Column IDs must be unique');
    }
    
    // Validate column properties
    config.columns.forEach((column, index) => {
      if (!column.id) {
        errors.push(`Column at index ${index} must have an ID`);
      }
      if (!column.name) {
        errors.push(`Column at index ${index} must have a name`);
      }
      if (column.width && (column.width < 0 || column.width > 2000)) {
        errors.push(`Column "${column.id}" width must be between 0 and 2000`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};
