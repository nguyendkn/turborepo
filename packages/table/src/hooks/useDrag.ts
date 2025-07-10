import { useState, useCallback } from 'react';
import type { DragState } from '../types/interaction';
import { DragRegionType } from '../types/interaction';
import type { SelectionRange } from '../types/selection';

/**
 * Hook for managing drag and drop functionality
 */
export function useDrag() {
  const [dragState, setDragState] = useState<DragState>({
    type: DragRegionType.None,
    delta: 0,
    ranges: [],
    isDragging: false,
  });

  const startDrag = useCallback((type: DragRegionType, ranges: SelectionRange[]) => {
    setDragState({
      type,
      delta: 0,
      ranges,
      isDragging: true,
    });
  }, []);

  const updateDrag = useCallback((delta: number) => {
    setDragState(prev => ({ ...prev, delta }));
  }, []);

  const endDrag = useCallback(() => {
    setDragState(prev => ({ ...prev, isDragging: false }));
  }, []);

  const resetDrag = useCallback(() => {
    setDragState({
      type: DragRegionType.None,
      delta: 0,
      ranges: [],
      isDragging: false,
    });
  }, []);

  return {
    dragState,
    startDrag,
    updateDrag,
    endDrag,
    resetDrag,
    isDragging: dragState.isDragging,
  };
}
