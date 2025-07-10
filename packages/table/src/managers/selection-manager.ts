import type { CombinedSelection, SelectionState } from '../types/selection';
import { SelectionRegionType } from '../types/selection';
import type { CellPosition } from '../types/cell';
import { isPositionInSelection, getPositionsFromSelection } from '../utils/selection';

/**
 * Manager for selection state and operations
 */
export class SelectionManager {
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
   * Set selection
   */
  setSelection(selection: CombinedSelection): void {
    this.state.selection = selection;
  }

  /**
   * Set active cell
   */
  setActiveCell(position: CellPosition | null): void {
    this.state.activeCell = position;
  }

  /**
   * Clear all selections
   */
  clearSelection(): void {
    this.state.selection = null;
    this.state.activeCell = null;
    this.state.anchor = null;
  }

  /**
   * Check if a position is selected
   */
  isPositionSelected(position: CellPosition): boolean {
    return isPositionInSelection(this.state.selection, position);
  }

  /**
   * Check if a position is active
   */
  isPositionActive(position: CellPosition): boolean {
    if (!this.state.activeCell) return false;
    const [activeCol, activeRow] = this.state.activeCell;
    const [col, row] = position;
    return activeCol === col && activeRow === row;
  }

  /**
   * Get all selected positions
   */
  getSelectedPositions(): CellPosition[] {
    return getPositionsFromSelection(
      this.state.selection,
      this.maxColumns,
      this.maxRows
    );
  }

  /**
   * Select range from anchor to position
   */
  selectRange(position: CellPosition): void {
    if (!this.state.anchor) {
      this.state.anchor = position;
    }

    const [anchorCol, anchorRow] = this.state.anchor;
    const [col, row] = position;

    const startCol = Math.min(anchorCol, col);
    const endCol = Math.max(anchorCol, col);
    const startRow = Math.min(anchorRow, row);
    const endRow = Math.max(anchorRow, row);

    this.state.selection = {
      type: SelectionRegionType.Cells,
      ranges: [[startCol, startRow, endCol, endRow]],
    };
  }

  /**
   * Select single cell
   */
  selectCell(position: CellPosition): void {
    const [col, row] = position;
    this.state.selection = {
      type: SelectionRegionType.Cells,
      ranges: [[col, row, col, row]],
    };
    this.state.activeCell = position;
    this.state.anchor = position;
  }

  /**
   * Select entire row
   */
  selectRow(rowIndex: number): void {
    this.state.selection = {
      type: SelectionRegionType.Rows,
      ranges: [[rowIndex, rowIndex]],
    };
    this.state.activeCell = [0, rowIndex];
    this.state.anchor = [0, rowIndex];
  }

  /**
   * Select entire column
   */
  selectColumn(columnIndex: number): void {
    this.state.selection = {
      type: SelectionRegionType.Columns,
      ranges: [[columnIndex, columnIndex]],
    };
    this.state.activeCell = [columnIndex, 0];
    this.state.anchor = [columnIndex, 0];
  }

  /**
   * Select all cells
   */
  selectAll(): void {
    if (this.maxColumns > 0 && this.maxRows > 0) {
      this.state.selection = {
        type: SelectionRegionType.Cells,
        ranges: [[0, 0, this.maxColumns - 1, this.maxRows - 1]],
      };
      this.state.activeCell = [0, 0];
      this.state.anchor = [0, 0];
    }
  }
}
