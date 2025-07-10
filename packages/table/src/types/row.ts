/**
 * Row control types
 */
export enum RowControlType {
  Drag = 'Drag',
  Expand = 'Expand',
  Checkbox = 'Checkbox',
}

/**
 * Row control item interface
 */
export interface RowControlItem {
  /** Control type */
  type: RowControlType;
  /** Optional icon */
  icon?: string;
}

/**
 * Row configuration interface
 */
export interface RowConfig {
  /** Row height */
  height?: number;
  /** Row controls */
  controls?: RowControlItem[];
  /** Whether row is selectable */
  selectable?: boolean;
  /** Whether row is expandable */
  expandable?: boolean;
  /** Whether row is draggable */
  draggable?: boolean;
  /** Custom CSS class for row */
  className?: string;
}

/**
 * Row state interface
 */
export interface RowState {
  /** Whether row is selected */
  selected: boolean;
  /** Whether row is expanded */
  expanded: boolean;
  /** Whether row is hovered */
  hovered: boolean;
  /** Whether row is being edited */
  editing: boolean;
}

/**
 * Row range type
 */
export type RowRange = [startIndex: number, endIndex: number];

/**
 * Linear row types for grouping
 */
export enum LinearRowType {
  Row = 'Row',
  GroupHeader = 'GroupHeader',
  GroupFooter = 'GroupFooter',
}

/**
 * Linear row interface
 */
export interface LinearRow {
  /** Row type */
  type: LinearRowType;
  /** Row index */
  index: number;
  /** Group ID if applicable */
  groupId?: string;
  /** Row data */
  data?: unknown;
}
