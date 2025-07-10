import type { CellPosition, CellRange, RowRange } from './cell';

/**
 * Selection region types
 */
export enum SelectionRegionType {
  Rows = 'Rows',
  Columns = 'Columns',
  Cells = 'Cells',
  None = 'None',
}

/**
 * Selectable types
 */
export enum SelectableType {
  All = 'All',
  None = 'None',
  Row = 'Row',
  Column = 'Column',
  Cell = 'Cell',
}

/**
 * Column range type
 */
export type ColumnRange = [startIndex: number, endIndex: number];

/**
 * Selection range union type
 */
export type SelectionRange = CellRange | ColumnRange | RowRange;

/**
 * Row selection interface
 */
export interface RowSelection {
  /** Selection type */
  type: SelectionRegionType.Rows;
  /** Selected row ranges */
  ranges: RowRange[];
}

/**
 * Column selection interface
 */
export interface ColumnSelection {
  /** Selection type */
  type: SelectionRegionType.Columns;
  /** Selected column ranges */
  ranges: ColumnRange[];
}

/**
 * Cell selection interface
 */
export interface CellSelection {
  /** Selection type */
  type: SelectionRegionType.Cells;
  /** Selected cell ranges */
  ranges: CellRange[];
}

/**
 * Combined selection type
 */
export type CombinedSelection = RowSelection | ColumnSelection | CellSelection | null;

/**
 * Selection state interface
 */
export interface SelectionState {
  /** Current selection */
  selection: CombinedSelection;
  /** Active cell position */
  activeCell: CellPosition | null;
  /** Whether multiple selection is enabled */
  multiSelect: boolean;
  /** Selection anchor point */
  anchor: CellPosition | null;
}

/**
 * Selection event handlers
 */
export interface SelectionEventHandlers {
  /** Selection change handler */
  onSelectionChange?: (selection: CombinedSelection) => void;
  /** Active cell change handler */
  onActiveCellChange?: (position: CellPosition | null) => void;
  /** Selection start handler */
  onSelectionStart?: (position: CellPosition) => void;
  /** Selection end handler */
  onSelectionEnd?: (selection: CombinedSelection) => void;
}
