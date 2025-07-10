import { useState, useCallback } from 'react';
import type { ColumnResizeState } from '../types/column';

/**
 * Hook for managing column resize functionality
 */
export function useColumnResize() {
  const [resizeState, setResizeState] = useState<ColumnResizeState | null>(null);
  const [columnSizing, setColumnSizing] = useState<Record<string, number>>({});

  const startResize = useCallback((columnIndex: number, x: number) => {
    setResizeState({
      columnIndex,
      width: 0,
      x,
    });
  }, []);

  const updateResize = useCallback((x: number, width: number) => {
    if (resizeState) {
      setResizeState(prev => prev ? { ...prev, x, width } : null);
    }
  }, [resizeState]);

  const endResize = useCallback((columnId: string, finalWidth: number) => {
    if (resizeState) {
      setColumnSizing(prev => ({ ...prev, [columnId]: finalWidth }));
      setResizeState(null);
    }
  }, [resizeState]);

  const resetColumnSizing = useCallback(() => {
    setColumnSizing({});
  }, []);

  return {
    resizeState,
    columnSizing,
    startResize,
    updateResize,
    endResize,
    resetColumnSizing,
    isResizing: resizeState !== null,
  };
}
