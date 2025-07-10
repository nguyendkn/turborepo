import type { ReactNode } from 'react';

/**
 * Cell position type
 */
export type CellPosition = [columnIndex: number, rowIndex: number];

/**
 * Cell range type
 */
export type CellRange = [startCol: number, startRow: number, endCol: number, endRow: number];

/**
 * Row range type
 */
export type RowRange = [startIndex: number, endIndex: number];

/**
 * Column range type
 */
export type ColumnRange = [startIndex: number, endIndex: number];

/**
 * Cell value types
 */
export type CellValue = string | number | boolean | Date | null | undefined;

/**
 * Cell interface
 */
export interface Cell {
  /** Cell value */
  value: CellValue;
  /** Cell display value */
  displayValue?: ReactNode;
  /** Cell type */
  type?: string;
  /** Whether cell is editable */
  editable?: boolean;
  /** Whether cell is readonly */
  readonly?: boolean;
  /** Cell validation error */
  error?: string;
  /** Custom CSS class */
  className?: string;
}

/**
 * Cell editor interface
 */
export interface CellEditor {
  /** Editor type */
  type: string;
  /** Editor component */
  component: ReactNode;
  /** Editor props */
  props?: Record<string, unknown>;
}

/**
 * Cell state interface
 */
export interface CellState {
  /** Whether cell is selected */
  selected: boolean;
  /** Whether cell is active (focused) */
  active: boolean;
  /** Whether cell is being edited */
  editing: boolean;
  /** Whether cell is hovered */
  hovered: boolean;
  /** Whether cell is loading */
  loading: boolean;
}

/**
 * Cell event handlers
 */
export interface CellEventHandlers {
  /** Cell click handler */
  onClick?: (position: CellPosition, value: CellValue) => void;
  /** Cell double click handler */
  onDoubleClick?: (position: CellPosition, value: CellValue) => void;
  /** Cell value change handler */
  onChange?: (position: CellPosition, newValue: CellValue, oldValue: CellValue) => void;
  /** Cell edit start handler */
  onEditStart?: (position: CellPosition) => void;
  /** Cell edit end handler */
  onEditEnd?: (position: CellPosition, value: CellValue) => void;
  /** Cell focus handler */
  onFocus?: (position: CellPosition) => void;
  /** Cell blur handler */
  onBlur?: (position: CellPosition) => void;
}
