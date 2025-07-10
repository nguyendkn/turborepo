import type { TableColumn } from './column';
import type { TableTheme } from './theme';
import type { CellPosition, Cell } from './cell';
import type { Rectangle, ScrollState, MouseState, DragState } from './interaction';
import type { CombinedSelection } from './selection';
import type { RowControlItem } from './row';

/**
 * Grid column interface extending table column
 */
export interface GridColumn extends TableColumn {
  /** Column statistics label */
  statisticLabel?: {
    showAlways: boolean;
    label: string;
  };
  /** Custom theme for column */
  customTheme?: Partial<TableTheme>;
}

/**
 * Group point interface for grouping
 */
export interface GroupPoint {
  /** Group ID */
  id: string;
  /** Group level */
  level: number;
  /** Start row index */
  startIndex: number;
  /** End row index */
  endIndex: number;
  /** Group title */
  title: string;
  /** Whether group is collapsed */
  collapsed: boolean;
}

/**
 * Group collection interface
 */
export interface GroupCollection {
  /** Group points */
  points: GroupPoint[];
  /** Collapsed group IDs */
  collapsedIds: Set<string>;
}

/**
 * Collaborator interface
 */
export interface Collaborator {
  /** Active cell position */
  activeCell?: CellPosition;
  /** Active cell ID */
  activeCellId: [recordId: string, fieldId: string];
  /** User information */
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  /** Border color for collaborator */
  borderColor: string;
  /** Timestamp */
  timeStamp: number;
}

/**
 * Sprite map interface for custom icons
 */
export interface SpriteMap {
  [key: string]: string;
}

/**
 * Indices map interface
 */
export interface IndicesMap {
  [key: string]: number;
}

/**
 * Grid external props interface
 */
export interface GridExternalProps {
  /** Custom theme */
  theme?: Partial<TableTheme>;
  /** Custom icons */
  customIcons?: SpriteMap;
  /** Row controls */
  rowControls?: RowControlItem[];
  /** Smooth scroll X */
  smoothScrollX?: boolean;
  /** Smooth scroll Y */
  smoothScrollY?: boolean;
  /** Scroll buffer X */
  scrollBufferX?: number;
  /** Scroll buffer Y */
  scrollBufferY?: number;
  /** Scroll bar visible */
  scrollBarVisible?: boolean;
  /** Row index visible */
  rowIndexVisible?: boolean;
  /** Collaborators */
  collaborators?: Collaborator[];
  /** Search cursor position */
  searchCursor?: [number, number] | null;
  /** Search hit indices */
  searchHitIndex?: { fieldId: string; recordId: string }[];
  /** Group collection */
  groupCollection?: GroupCollection | null;
  /** Collapsed group IDs */
  collapsedGroupIds?: Set<string> | null;
  /** Group points */
  groupPoints?: GroupPoint[] | null;
}

/**
 * Grid props interface
 */
export interface GridProps extends GridExternalProps {
  /** Grid columns */
  columns: GridColumn[];
  /** Comment count map */
  commentCountMap?: Record<string, number>;
  /** Freeze column count */
  freezeColumnCount?: number;
  /** Row count */
  rowCount: number;
  /** Row height */
  rowHeight?: number;
  /** Touch device flag */
  isTouchDevice?: boolean;
  /** Column header height */
  columnHeaderHeight?: number;
  /** Column statistics */
  columnStatistics?: Record<string, unknown>;
  /** Get cell content function */
  getCellContent: (cell: CellPosition) => Cell;
}

/**
 * Grid ref interface
 */
export interface GridRef {
  /** Reset grid state */
  resetState: () => void;
  /** Force update */
  forceUpdate: () => void;
  /** Get active cell */
  getActiveCell: () => CellPosition | null;
  /** Get row offset */
  getRowOffset: (rowIndex: number) => number;
  /** Set selection */
  setSelection: (selection: CombinedSelection) => void;
  /** Get scroll state */
  getScrollState: () => ScrollState;
  /** Scroll by delta */
  scrollBy: (deltaX: number, deltaY: number) => void;
  /** Scroll to position */
  scrollTo: (scrollLeft?: number, scrollTop?: number) => void;
  /** Scroll to item */
  scrollToItem: (position: [columnIndex: number, rowIndex: number]) => void;
  /** Get cell indices at position */
  getCellIndicesAtPosition: (x: number, y: number) => CellPosition | null;
  /** Get container element */
  getContainer: () => HTMLDivElement | null;
  /** Get cell bounds */
  getCellBounds: (cell: CellPosition) => Rectangle | null;
  /** Set cell loading */
  setCellLoading: (cells: CellPosition[]) => void;
  /** Set column loadings */
  setColumnLoadings: (columnLoadings: Array<{ columnId: string; loading: boolean }>) => void;
  /** Check if editing */
  isEditing: () => boolean | undefined;
}
