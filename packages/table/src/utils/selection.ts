import type { CombinedSelection, SelectionRegionType } from '../types/selection';
import type { CellPosition } from '../types/cell';

/**
 * Check if a row or cell is selected
 */
export const checkIfRowOrCellSelected = (
  selection: CombinedSelection,
  rowIndex: number,
  columnIndex: number
) => {
  if (!selection) {
    return {
      isRowSelected: false,
      isCellSelected: false,
    };
  }

  const { type, ranges } = selection;

  if (type === 'Rows') {
    // Check if row is in any of the row ranges
    for (const range of ranges) {
      const [startRow, endRow] = range;
      if (rowIndex >= startRow && rowIndex <= endRow) {
        return {
          isRowSelected: true,
          isCellSelected: true,
        };
      }
    }
  }

  if (type === 'Cells') {
    // Check if cell is in any of the cell ranges
    for (const range of ranges) {
      const [startCol, startRow, endCol, endRow] = range;
      if (
        columnIndex >= startCol &&
        columnIndex <= endCol &&
        rowIndex >= startRow &&
        rowIndex <= endRow
      ) {
        return {
          isRowSelected: false,
          isCellSelected: true,
        };
      }
    }
  }

  if (type === 'Columns') {
    // Check if column is in any of the column ranges
    for (const range of ranges) {
      const [startCol, endCol] = range;
      if (columnIndex >= startCol && columnIndex <= endCol) {
        return {
          isRowSelected: false,
          isCellSelected: true,
        };
      }
    }
  }

  return {
    isRowSelected: false,
    isCellSelected: false,
  };
};

/**
 * Check if a row or cell is active (focused)
 */
export const checkIfRowOrCellActive = (
  activeCell: CellPosition | null,
  rowIndex: number,
  columnIndex: number
) => {
  if (!activeCell) {
    return {
      isRowActive: false,
      isCellActive: false,
    };
  }

  const [activeCellCol, activeCellRow] = activeCell;
  const isCellActive = activeCellCol === columnIndex && activeCellRow === rowIndex;
  const isRowActive = activeCellRow === rowIndex;

  return {
    isRowActive,
    isCellActive,
  };
};

/**
 * Check if a position is within selection
 */
export const isPositionInSelection = (
  selection: CombinedSelection,
  position: CellPosition
): boolean => {
  if (!selection) return false;

  const [col, row] = position;
  const { type, ranges } = selection;

  switch (type) {
    case 'Cells':
      return ranges.some(range => {
        const [startCol, startRow, endCol, endRow] = range;
        return col >= startCol && col <= endCol && row >= startRow && row <= endRow;
      });

    case 'Rows':
      return ranges.some(range => {
        const [startRow, endRow] = range;
        return row >= startRow && row <= endRow;
      });

    case 'Columns':
      return ranges.some(range => {
        const [startCol, endCol] = range;
        return col >= startCol && col <= endCol;
      });

    default:
      return false;
  }
};

/**
 * Get all positions within a selection
 */
export const getPositionsFromSelection = (
  selection: CombinedSelection,
  maxColumns: number,
  maxRows: number
): CellPosition[] => {
  if (!selection) return [];

  const positions: CellPosition[] = [];
  const { type, ranges } = selection;

  switch (type) {
    case 'Cells':
      ranges.forEach(range => {
        const [startCol, startRow, endCol, endRow] = range;
        for (let row = startRow; row <= endRow; row++) {
          for (let col = startCol; col <= endCol; col++) {
            positions.push([col, row]);
          }
        }
      });
      break;

    case 'Rows':
      ranges.forEach(range => {
        const [startRow, endRow] = range;
        for (let row = startRow; row <= endRow; row++) {
          for (let col = 0; col < maxColumns; col++) {
            positions.push([col, row]);
          }
        }
      });
      break;

    case 'Columns':
      ranges.forEach(range => {
        const [startCol, endCol] = range;
        for (let col = startCol; col <= endCol; col++) {
          for (let row = 0; row < maxRows; row++) {
            positions.push([col, row]);
          }
        }
      });
      break;
  }

  return positions;
};
