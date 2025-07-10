import type { CellPosition } from './cell';
import type { SelectionRange } from './selection';

/**
 * Mouse button types
 */
export enum MouseButtonType {
  Left = 0,
  Center = 1,
  Right = 2,
}

/**
 * Draggable types
 */
export enum DraggableType {
  All = 'All',
  None = 'None',
  Row = 'Row',
  Column = 'Column',
}

/**
 * Drag region types
 */
export enum DragRegionType {
  Rows = 'Rows',
  Columns = 'Columns',
  None = 'None',
}

/**
 * Region types for interaction
 */
export enum RegionType {
  Cell = 'Cell',
  ActiveCell = 'ActiveCell',
  AppendRow = 'AppendRow',
  AppendColumn = 'AppendColumn',
  ColumnHeader = 'ColumnHeader',
  GroupStatistic = 'GroupStatistic',
  ColumnStatistic = 'ColumnStatistic',
  ColumnHeaderMenu = 'ColumnHeaderMenu',
  ColumnPrimaryIcon = 'ColumnPrimaryIcon',
  ColumnDescription = 'ColumnDescription',
  ColumnResizeHandler = 'ColumnResizeHandler',
  ColumnFreezeHandler = 'ColumnFreezeHandler',
  RowHeaderDragHandler = 'RowHeaderDragHandler',
  RowHeaderExpandHandler = 'RowHeaderExpandHandler',
  RowHeaderCheckbox = 'RowHeaderCheckbox',
  RowGroupControl = 'RowGroupControl',
  RowGroupHeader = 'RowGroupHeader',
  RowCountLabel = 'RowCountLabel',
  RowHeader = 'RowHeader',
  AllCheckbox = 'AllCheckbox',
  FillHandler = 'FillHandler',
  Blank = 'Blank',
  None = 'None',
}

/**
 * Position interface
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Rectangle interface
 */
export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Region position interface
 */
export interface RegionPosition extends Position {
  rowIndex: number;
  columnIndex: number;
}

/**
 * Mouse state interface
 */
export interface MouseState extends RegionPosition {
  type: RegionType;
  isOutOfBounds: boolean;
}

/**
 * Drag state interface
 */
export interface DragState {
  type: DragRegionType;
  delta: number;
  ranges: SelectionRange[];
  isDragging: boolean;
}

/**
 * Scroll direction type
 */
export type ScrollDirection = -1 | 0 | 1;

/**
 * Scroll state interface
 */
export interface ScrollState {
  scrollTop: number;
  scrollLeft: number;
  isScrolling: boolean;
}

/**
 * Interaction event handlers
 */
export interface InteractionEventHandlers {
  /** Mouse down handler */
  onMouseDown?: (event: MouseEvent, position: CellPosition) => void;
  /** Mouse up handler */
  onMouseUp?: (event: MouseEvent, position: CellPosition) => void;
  /** Mouse move handler */
  onMouseMove?: (event: MouseEvent, position: CellPosition) => void;
  /** Drag start handler */
  onDragStart?: (type: DragRegionType, ranges: SelectionRange[]) => void;
  /** Drag end handler */
  onDragEnd?: (type: DragRegionType, ranges: SelectionRange[]) => void;
  /** Scroll handler */
  onScroll?: (scrollState: ScrollState) => void;
  /** Key down handler */
  onKeyDown?: (event: KeyboardEvent) => void;
  /** Key up handler */
  onKeyUp?: (event: KeyboardEvent) => void;
}
