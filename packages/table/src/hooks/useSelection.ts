import { useState, useCallback } from 'react';
import type { CombinedSelection, SelectionState } from '../types/selection';
import type { CellPosition } from '../types/cell';

/**
 * Hook for managing table selection state
 */
export function useSelection(initialState?: Partial<SelectionState>) {
  const [selectionState, setSelectionState] = useState<SelectionState>({
    selection: null,
    activeCell: null,
    multiSelect: true,
    anchor: null,
    ...initialState,
  });

  const setSelection = useCallback((selection: CombinedSelection) => {
    setSelectionState(prev => ({ ...prev, selection }));
  }, []);

  const setActiveCell = useCallback((activeCell: CellPosition | null) => {
    setSelectionState(prev => ({ ...prev, activeCell }));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectionState(prev => ({ 
      ...prev, 
      selection: null, 
      activeCell: null, 
      anchor: null 
    }));
  }, []);

  return {
    selectionState,
    setSelection,
    setActiveCell,
    clearSelection,
    setSelectionState,
  };
}
