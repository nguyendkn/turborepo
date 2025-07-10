import type { CellPosition, CellRange, RowRange, ColumnRange } from '../types/cell';
import type { SelectionRange, CombinedSelection, SelectionState } from '../types/selection';
import { SelectionRegionType } from '../types/selection';
import {
  isRangeWithinRanges,
  flatRanges,
  isPointInsideRectangle,
  serializedRanges,
  mixRanges,
} from '../utils/range';

/**
 * Advanced CombinedSelection class (based on teable's implementation)
 * Provides 100% compatibility with source grid selection system
 */
export class AdvancedCombinedSelection {
  public type: SelectionRegionType;
  public ranges: SelectionRange[];

  constructor(type: SelectionRegionType = SelectionRegionType.None, ranges: SelectionRange[] = []) {
    this.type = type;
    this.ranges = ranges;
  }

  public get isColumnSelection(): boolean {
    return this.type === SelectionRegionType.Columns;
  }

  public get isRowSelection(): boolean {
    return this.type === SelectionRegionType.Rows;
  }

  public get isCellSelection(): boolean {
    return this.type === SelectionRegionType.Cells;
  }

  public get isNoneSelection(): boolean {
    return this.type === SelectionRegionType.None;
  }

  public reset(): AdvancedCombinedSelection {
    return emptyAdvancedSelection;
  }

  public set(type: SelectionRegionType, ranges: SelectionRange[]): AdvancedCombinedSelection {
    if (!Array.isArray(ranges)) {
      throw Error('Ranges of the selection should be an array type!');
    }

    if (type === SelectionRegionType.Cells && ranges.length < 2) {
      throw Error('Ranges of type cells should have a length greater than 2!');
    }

    if ([SelectionRegionType.Columns, SelectionRegionType.Rows].includes(type) && !ranges.length) {
      throw Error('Ranges of type columns or rows should have a length greater than 1!');
    }

    return new AdvancedCombinedSelection(type, ranges);
  }

  public setRanges(ranges: SelectionRange[]): AdvancedCombinedSelection {
    return new AdvancedCombinedSelection(this.type, ranges);
  }

  private isOverlap(range1: SelectionRange, range2: SelectionRange): boolean {
    return !(range1[1] < range2[0] || range1[0] > range2[1]);
  }

  public expand(range: SelectionRange): AdvancedCombinedSelection {
    switch (this.type) {
      case SelectionRegionType.Rows:
      case SelectionRegionType.Columns: {
        let hasOverlap = false;
        const newRanges = this.ranges.map((existedRange) => {
          if (this.isOverlap(existedRange, range)) {
            hasOverlap = true;
            return [
              Math.min(existedRange[0], range[0]),
              Math.max(existedRange[1], range[1]),
            ] as SelectionRange;
          }
          return existedRange;
        });

        if (!hasOverlap) {
          newRanges.push(range);
        }
        return new AdvancedCombinedSelection(this.type, serializedRanges(newRanges));
      }
      case SelectionRegionType.Cells:
        return new AdvancedCombinedSelection(this.type, [this.ranges[0]!, range]);
      default:
        return emptyAdvancedSelection;
    }
  }

  public merge(range: SelectionRange): AdvancedCombinedSelection {
    switch (this.type) {
      case SelectionRegionType.Rows:
      case SelectionRegionType.Columns: {
        const newRanges = mixRanges(this.ranges, range);
        return newRanges.length ? new AdvancedCombinedSelection(this.type, newRanges) : emptyAdvancedSelection;
      }
      case SelectionRegionType.Cells:
        return new AdvancedCombinedSelection(this.type, [this.ranges[0]!, range]);
      default:
        return emptyAdvancedSelection;
    }
  }

  public flatten(): number[] {
    const [start, end] = this.ranges;
    if (this.isCellSelection && start && end) return [...start, ...end];
    return flatRanges(this.ranges);
  }

  public serialize(): SelectionRange[] {
    switch (this.type) {
      case SelectionRegionType.Rows:
      case SelectionRegionType.Columns:
        return serializedRanges(this.ranges);
      case SelectionRegionType.Cells: {
        const [start, end] = this.ranges;
        if (!start || !end) return [];
        return [
          [Math.min(start[0], end[0]), Math.min(start[1], end[1])],
          [Math.max(start[0], end[0]), Math.max(start[1], end[1])],
        ];
      }
      default:
        return [];
    }
  }

  public includes(range?: SelectionRange): boolean {
    if (range == null) return false;
    switch (this.type) {
      case SelectionRegionType.Rows:
      case SelectionRegionType.Columns:
        return isRangeWithinRanges(range, this.ranges);
      case SelectionRegionType.Cells:
        const [start, end] = this.ranges;
        if (!start || !end) return false;
        // For cell ranges, check if the range is within the selection bounds
        if (range.length === 4) {
          // CellRange: [startCol, startRow, endCol, endRow]
          const [checkStartCol, checkStartRow, checkEndCol, checkEndRow] = range;
          const [startCol, startRow] = start;
          const [endCol, endRow] = end;
          return checkStartCol >= startCol && checkEndCol <= endCol &&
                 checkStartRow >= startRow && checkEndRow <= endRow;
        } else {
          // RowRange or ColumnRange: [start, end]
          const [checkStart, checkEnd] = range;
          const [startVal] = start;
          const [endVal] = end;
          return checkStart >= startVal && checkEnd <= endVal;
        }
      default:
        return false;
    }
  }

  public equals(comparisonRanges: SelectionRange[]): boolean {
    if (this.ranges.length !== comparisonRanges.length) return false;
    return JSON.stringify(this.ranges) === JSON.stringify(comparisonRanges);
  }

  /**
   * Convert to standard CombinedSelection format
   */
  public toStandardSelection(): CombinedSelection {
    if (this.isNoneSelection) return null;

    // Convert ranges to appropriate types based on selection type
    switch (this.type) {
      case SelectionRegionType.Rows:
        return {
          type: this.type,
          ranges: this.ranges as RowRange[],
        };
      case SelectionRegionType.Columns:
        return {
          type: this.type,
          ranges: this.ranges as ColumnRange[],
        };
      case SelectionRegionType.Cells:
        return {
          type: this.type,
          ranges: this.ranges as CellRange[],
        };
      default:
        return null;
    }
  }

  /**
   * Create from standard CombinedSelection
   */
  public static fromStandardSelection(selection: CombinedSelection): AdvancedCombinedSelection {
    if (!selection) return emptyAdvancedSelection;
    return new AdvancedCombinedSelection(selection.type, selection.ranges);
  }
}

export const emptyAdvancedSelection = new AdvancedCombinedSelection(SelectionRegionType.None, []);

/**
 * Enhanced Selection Manager with 100% teable compatibility
 */
export class AdvancedSelectionManager {
  private state: SelectionState;
  private maxColumns: number;
  private maxRows: number;

  constructor(
    initialState: SelectionState,
    maxColumns: number = 0,
    maxRows: number = 0
  ) {
    this.state = { ...initialState };
    this.maxColumns = maxColumns;
    this.maxRows = maxRows;
  }

  /**
   * Update dimensions
   */
  setDimensions(maxColumns: number, maxRows: number): void {
    this.maxColumns = maxColumns;
    this.maxRows = maxRows;
  }

  /**
   * Get current selection state
   */
  getState(): SelectionState {
    return { ...this.state };
  }

  /**
   * Set selection using advanced selection
   */
  setAdvancedSelection(selection: AdvancedCombinedSelection): void {
    this.state.selection = selection.toStandardSelection();
  }

  /**
   * Get advanced selection
   */
  getAdvancedSelection(): AdvancedCombinedSelection {
    return AdvancedCombinedSelection.fromStandardSelection(this.state.selection);
  }

  /**
   * Select cell with advanced features
   */
  selectCellAdvanced(position: CellPosition, extend = false, toggle = false): void {
    const [col, row] = position;
    const range: SelectionRange = [col, row];
    
    if (extend && this.state.activeCell) {
      // Extend selection from active cell
      const [activeCol, activeRow] = this.state.activeCell;
      const activeRange: SelectionRange = [activeCol, activeRow];
      
      const selection = new AdvancedCombinedSelection(SelectionRegionType.Cells, [activeRange, range]);
      this.setAdvancedSelection(selection);
    } else if (toggle) {
      // Toggle selection
      const currentSelection = this.getAdvancedSelection();
      if (currentSelection.includes(range)) {
        // Remove from selection
        const newSelection = currentSelection.merge(range);
        this.setAdvancedSelection(newSelection);
      } else {
        // Add to selection
        const newSelection = currentSelection.expand(range);
        this.setAdvancedSelection(newSelection);
      }
    } else {
      // Single cell selection
      const selection = new AdvancedCombinedSelection(SelectionRegionType.Cells, [range, range]);
      this.setAdvancedSelection(selection);
    }
    
    this.state.activeCell = position;
  }

  /**
   * Select row with advanced features
   */
  selectRowAdvanced(rowIndex: number, extend = false, toggle = false): void {
    const range: SelectionRange = [rowIndex, rowIndex];
    
    if (extend && this.state.selection?.type === SelectionRegionType.Rows) {
      const currentSelection = this.getAdvancedSelection();
      const newSelection = currentSelection.expand(range);
      this.setAdvancedSelection(newSelection);
    } else if (toggle && this.state.selection?.type === SelectionRegionType.Rows) {
      const currentSelection = this.getAdvancedSelection();
      const newSelection = currentSelection.merge(range);
      this.setAdvancedSelection(newSelection);
    } else {
      const selection = new AdvancedCombinedSelection(SelectionRegionType.Rows, [range]);
      this.setAdvancedSelection(selection);
    }
    
    this.state.activeCell = [0, rowIndex];
  }

  /**
   * Select column with advanced features
   */
  selectColumnAdvanced(columnIndex: number, extend = false, toggle = false): void {
    const range: SelectionRange = [columnIndex, columnIndex];
    
    if (extend && this.state.selection?.type === SelectionRegionType.Columns) {
      const currentSelection = this.getAdvancedSelection();
      const newSelection = currentSelection.expand(range);
      this.setAdvancedSelection(newSelection);
    } else if (toggle && this.state.selection?.type === SelectionRegionType.Columns) {
      const currentSelection = this.getAdvancedSelection();
      const newSelection = currentSelection.merge(range);
      this.setAdvancedSelection(newSelection);
    } else {
      const selection = new AdvancedCombinedSelection(SelectionRegionType.Columns, [range]);
      this.setAdvancedSelection(selection);
    }
    
    this.state.activeCell = [columnIndex, 0];
  }

  /**
   * Select all cells
   */
  selectAllAdvanced(): void {
    const cellRange: SelectionRange = [0, 0];
    const endRange: SelectionRange = [this.maxColumns - 1, this.maxRows - 1];
    const selection = new AdvancedCombinedSelection(SelectionRegionType.Cells, [cellRange, endRange]);
    this.setAdvancedSelection(selection);
    this.state.activeCell = [0, 0];
  }

  /**
   * Clear selection
   */
  clearSelection(): void {
    this.state.selection = null;
    this.state.activeCell = null;
    this.state.anchor = null;
  }
}
