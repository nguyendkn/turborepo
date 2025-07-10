import type { CellPosition } from '../types/cell';
import type { Position, Rectangle } from '../types/interaction';

/**
 * Check if two positions are equal
 */
export const isPositionEqual = (pos1: CellPosition | null, pos2: CellPosition | null): boolean => {
  if (!pos1 || !pos2) return pos1 === pos2;
  return pos1[0] === pos2[0] && pos1[1] === pos2[1];
};

/**
 * Check if a position is valid
 */
export const isValidPosition = (
  position: CellPosition,
  maxColumns: number,
  maxRows: number
): boolean => {
  const [col, row] = position;
  return col >= 0 && col < maxColumns && row >= 0 && row < maxRows;
};

/**
 * Get adjacent position in a direction
 */
export const getAdjacentPosition = (
  position: CellPosition,
  direction: 'up' | 'down' | 'left' | 'right'
): CellPosition => {
  const [col, row] = position;

  switch (direction) {
    case 'up':
      return [col, Math.max(0, row - 1)];
    case 'down':
      return [col, row + 1];
    case 'left':
      return [Math.max(0, col - 1), row];
    case 'right':
      return [col + 1, row];
    default:
      return position;
  }
};

/**
 * Calculate distance between two positions
 */
export const getPositionDistance = (pos1: CellPosition, pos2: CellPosition): number => {
  const [col1, row1] = pos1;
  const [col2, row2] = pos2;
  return Math.sqrt(Math.pow(col2 - col1, 2) + Math.pow(row2 - row1, 2));
};

/**
 * Get position from pixel coordinates
 */
export const getPositionFromCoordinates = (
  x: number,
  y: number,
  columnWidths: number[],
  rowHeight: number,
  headerHeight: number = 0
): CellPosition | null => {
  // Adjust for header height
  const adjustedY = y - headerHeight;
  if (adjustedY < 0) return null;

  // Calculate row index
  const rowIndex = Math.floor(adjustedY / rowHeight);

  // Calculate column index
  let columnIndex = 0;
  let currentX = 0;

  for (let i = 0; i < columnWidths.length; i++) {
    const width = columnWidths[i] || 0;
    if (x >= currentX && x < currentX + width) {
      columnIndex = i;
      break;
    }
    currentX += width;
  }

  return [columnIndex, rowIndex];
};

/**
 * Get pixel coordinates from position
 */
export const getCoordinatesFromPosition = (
  position: CellPosition,
  columnWidths: number[],
  rowHeight: number,
  headerHeight: number = 0
): Position => {
  const [col, row] = position;

  // Calculate x coordinate
  let x = 0;
  for (let i = 0; i < col && i < columnWidths.length; i++) {
    x += columnWidths[i] || 0;
  }

  // Calculate y coordinate
  const y = headerHeight + row * rowHeight;

  return { x, y };
};

/**
 * Get rectangle bounds for a position
 */
export const getRectangleFromPosition = (
  position: CellPosition,
  columnWidths: number[],
  rowHeight: number,
  headerHeight: number = 0
): Rectangle => {
  const [col, row] = position;
  const { x, y } = getCoordinatesFromPosition(position, columnWidths, rowHeight, headerHeight);
  const width = columnWidths[col] || 0;
  const height = rowHeight;

  return { x, y, width, height };
};

/**
 * Check if a point is inside a rectangle
 */
export const isPointInRectangle = (point: Position, rectangle: Rectangle): boolean => {
  return (
    point.x >= rectangle.x &&
    point.x <= rectangle.x + rectangle.width &&
    point.y >= rectangle.y &&
    point.y <= rectangle.y + rectangle.height
  );
};

/**
 * Clamp position to valid bounds
 */
export const clampPosition = (
  position: CellPosition,
  maxColumns: number,
  maxRows: number
): CellPosition => {
  const [col, row] = position;
  return [
    Math.max(0, Math.min(col, maxColumns - 1)),
    Math.max(0, Math.min(row, maxRows - 1))
  ];
};
