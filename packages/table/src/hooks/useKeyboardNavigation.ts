import { useCallback } from 'react';
import type { CellPosition } from '../types/cell';
import { getNextPositionFromKey, shouldPreventDefault, shouldStartEditing } from '../utils/keyboard';

/**
 * Hook for keyboard navigation in tables
 */
export function useKeyboardNavigation(
  maxColumns: number,
  maxRows: number,
  onPositionChange?: (position: CellPosition) => void,
  onStartEditing?: (position: CellPosition) => void
) {
  const handleKeyDown = useCallback((
    event: KeyboardEvent,
    currentPosition: CellPosition
  ) => {
    if (shouldPreventDefault(event)) {
      event.preventDefault();
    }

    // Handle navigation
    const nextPosition = getNextPositionFromKey(
      currentPosition,
      event.code,
      maxColumns,
      maxRows,
      event.shiftKey
    );

    if (nextPosition[0] !== currentPosition[0] || nextPosition[1] !== currentPosition[1]) {
      onPositionChange?.(nextPosition);
    }

    // Handle editing
    if (shouldStartEditing(event)) {
      onStartEditing?.(currentPosition);
    }
  }, [maxColumns, maxRows, onPositionChange, onStartEditing]);

  return {
    handleKeyDown,
  };
}
