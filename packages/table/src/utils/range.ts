import type { CellRange, RowRange, ColumnRange } from '../types/cell';
import type { SelectionRange, CombinedSelection } from '../types/selection';

/**
 * Check if a range is within other ranges
 */
export const isRangeWithinRanges = (checkedRange: SelectionRange, ranges: SelectionRange[]) => {
  const [checkedStart, checkedEnd] = checkedRange;

  for (const range of ranges) {
    const [rangeStart, rangeEnd] = range;

    if (rangeStart <= checkedStart && rangeEnd >= checkedEnd) {
      return true;
    }
  }
  return false;
};

/**
 * Flatten ranges to array of indices
 */
export const flatRanges = (ranges: SelectionRange[]): number[] => {
  const result: number[] = [];
  for (const range of ranges) {
    for (let i = range[0]; i <= range[1]; i++) {
      result.push(i);
    }
  }
  return result;
};

/**
 * Check if a point is inside a rectangle
 */
export const isPointInsideRectangle = (
  checkPoint: [number, number],
  startPoint: [number, number],
  endPoint: [number, number]
): boolean => {
  const [checkX, checkY] = checkPoint;
  const [startX, startY] = startPoint;
  const [endX, endY] = endPoint;

  const minX = Math.min(startX, endX);
  const maxX = Math.max(startX, endX);
  const minY = Math.min(startY, endY);
  const maxY = Math.max(startY, endY);

  return checkX >= minX && checkX <= maxX && checkY >= minY && checkY <= maxY;
};

/**
 * Check if a number is in range
 */
export const inRange = (num: number, start: number, end: number) => {
  if (start > end) {
    return num >= end && num <= start;
  }
  return num >= start && num <= end;
};

/**
 * Serialize ranges - merge overlapping ranges (from teable)
 */
export const serializedRanges = (ranges: SelectionRange[]): SelectionRange[] => {
  if (ranges.length <= 1) {
    return ranges;
  }

  const sortedRanges = [...ranges].sort((a, b) => a[0] - b[0]);
  const mergedRanges: SelectionRange[] = [];
  let currentRange: SelectionRange = [sortedRanges[0]![0], sortedRanges[0]![1]];

  for (let i = 1; i < sortedRanges.length; i++) {
    const nextRange = sortedRanges[i]!;
    if (nextRange[0] <= currentRange[1] + 1) {
      currentRange = [currentRange[0], Math.max(currentRange[1], nextRange[1])];
    } else {
      mergedRanges.push(currentRange);
      currentRange = [nextRange[0], nextRange[1]];
    }
  }
  mergedRanges.push(currentRange);

  return mergedRanges;
};

/**
 * Mix ranges - complex range operations (from teable)
 */
export const mixRanges = (ranges: SelectionRange[], newRange: SelectionRange): SelectionRange[] => {
  const result: SelectionRange[] = [];
  let added = false;

  for (const range of ranges) {
    if (!added && range[0] === newRange[0] && newRange[1] === range[1]) {
      added = true;
    } else if (!added && newRange[0] > range[0] && newRange[1] < range[1]) {
      result.push([range[0], newRange[0] - 1]);
      result.push([newRange[1] + 1, range[1]]);
      added = true;
    } else if (!added && newRange[0] <= range[1] && newRange[1] >= range[0]) {
      if (newRange[0] > range[0]) {
        result.push([range[0], newRange[0] - 1]);
      }
      if (newRange[1] < range[1]) {
        result.push([newRange[1] + 1, range[1]]);
      }
      added = true;
    } else {
      result.push([...range]);
    }
  }

  if (!added) {
    result.push(newRange);
  }

  return serializedRanges(result);
};

/**
 * Check if two ranges overlap
 */
export const rangesOverlap = (range1: SelectionRange, range2: SelectionRange): boolean => {
  return range1[0] <= range2[1] && range2[0] <= range1[1];
};

/**
 * Merge two overlapping ranges
 */
export const mergeRanges = (range1: SelectionRange, range2: SelectionRange): SelectionRange => {
  return [
    Math.min(range1[0], range2[0]),
    Math.max(range1[1], range2[1])
  ];
};

/**
 * Get the intersection of two ranges
 */
export const intersectRanges = (range1: SelectionRange, range2: SelectionRange): SelectionRange | null => {
  const start = Math.max(range1[0], range2[0]);
  const end = Math.min(range1[1], range2[1]);

  if (start <= end) {
    return [start, end];
  }

  return null;
};

/**
 * Convert range to array of numbers
 */
export const rangeToArray = (range: SelectionRange): number[] => {
  const result: number[] = [];
  for (let i = range[0]; i <= range[1]; i++) {
    result.push(i);
  }
  return result;
};


