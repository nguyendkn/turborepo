import { useState, useCallback } from 'react';
import type { CellPosition } from '../types/cell';

/**
 * Column freeze state
 */
export interface ColumnFreezeState {
  sourceIndex: number;
  targetIndex: number;
  isFreezing: boolean;
}

/**
 * Column freeze configuration
 */
export interface ColumnFreezeConfig {
  /** Initial freeze column count */
  initialFreezeCount?: number;
  /** Maximum columns that can be frozen */
  maxFreezeCount?: number;
  /** Minimum columns that must remain unfrozen */
  minUnfrozenCount?: number;
  /** Callback when freeze count changes */
  onFreezeCountChange?: (count: number) => void;
  /** Callback when freeze operation starts */
  onFreezeStart?: (state: ColumnFreezeState) => void;
  /** Callback when freeze operation ends */
  onFreezeEnd?: (state: ColumnFreezeState, success: boolean) => void;
}

/**
 * Hook for managing column freeze functionality
 */
export function useColumnFreeze(config: ColumnFreezeConfig = {}) {
  const {
    initialFreezeCount = 1,
    maxFreezeCount = 10,
    minUnfrozenCount = 1,
    onFreezeCountChange,
    onFreezeStart,
    onFreezeEnd,
  } = config;

  const [freezeColumnCount, setFreezeColumnCount] = useState(initialFreezeCount);
  const [freezeState, setFreezeState] = useState<ColumnFreezeState>({
    sourceIndex: -1,
    targetIndex: -1,
    isFreezing: false,
  });

  // Start freeze operation
  const startFreeze = useCallback((sourceIndex: number, targetIndex: number) => {
    const newState: ColumnFreezeState = {
      sourceIndex,
      targetIndex,
      isFreezing: true,
    };
    
    setFreezeState(newState);
    onFreezeStart?.(newState);
  }, [onFreezeStart]);

  // Update freeze target
  const updateFreeze = useCallback((targetIndex: number) => {
    setFreezeState(prev => ({
      ...prev,
      targetIndex,
    }));
  }, []);

  // End freeze operation
  const endFreeze = useCallback((success = true) => {
    const currentState = freezeState;
    
    if (success && currentState.isFreezing) {
      // Apply freeze change
      const newFreezeCount = Math.max(0, currentState.targetIndex + 1);
      
      if (isValidFreezeCount(newFreezeCount, maxFreezeCount, minUnfrozenCount)) {
        setFreezeColumnCount(newFreezeCount);
        onFreezeCountChange?.(newFreezeCount);
      }
    }

    // Reset freeze state
    const finalState: ColumnFreezeState = {
      sourceIndex: -1,
      targetIndex: -1,
      isFreezing: false,
    };
    
    setFreezeState(finalState);
    onFreezeEnd?.(currentState, success);
  }, [freezeState, maxFreezeCount, minUnfrozenCount, onFreezeCountChange, onFreezeEnd]);

  // Cancel freeze operation
  const cancelFreeze = useCallback(() => {
    endFreeze(false);
  }, [endFreeze]);

  // Set freeze count directly
  const setFreezeCount = useCallback((count: number) => {
    if (isValidFreezeCount(count, maxFreezeCount, minUnfrozenCount)) {
      setFreezeColumnCount(count);
      onFreezeCountChange?.(count);
      return true;
    }
    return false;
  }, [maxFreezeCount, minUnfrozenCount, onFreezeCountChange]);

  // Freeze column at specific index
  const freezeColumn = useCallback((columnIndex: number) => {
    return setFreezeCount(columnIndex + 1);
  }, [setFreezeCount]);

  // Unfreeze column at specific index
  const unfreezeColumn = useCallback((columnIndex: number) => {
    if (columnIndex < freezeColumnCount) {
      return setFreezeCount(columnIndex);
    }
    return false;
  }, [freezeColumnCount, setFreezeCount]);

  // Check if column is frozen
  const isColumnFrozen = useCallback((columnIndex: number): boolean => {
    return columnIndex < freezeColumnCount;
  }, [freezeColumnCount]);

  // Check if cell is in frozen region
  const isCellInFrozenRegion = useCallback((position: CellPosition): boolean => {
    const [columnIndex] = position;
    return isColumnFrozen(columnIndex);
  }, [isColumnFrozen]);

  // Get frozen columns range
  const getFrozenColumnsRange = useCallback((): [number, number] | null => {
    if (freezeColumnCount <= 0) return null;
    return [0, freezeColumnCount - 1];
  }, [freezeColumnCount]);

  // Get unfrozen columns range
  const getUnfrozenColumnsRange = useCallback((totalColumns: number): [number, number] | null => {
    if (freezeColumnCount >= totalColumns) return null;
    return [freezeColumnCount, totalColumns - 1];
  }, [freezeColumnCount]);

  // Check if freeze operation is valid
  const canFreeze = useCallback((targetIndex: number, totalColumns: number): boolean => {
    const newFreezeCount = targetIndex + 1;
    return isValidFreezeCount(newFreezeCount, maxFreezeCount, minUnfrozenCount, totalColumns);
  }, [maxFreezeCount, minUnfrozenCount]);

  return {
    // State
    freezeColumnCount,
    freezeState,
    isFreezing: freezeState.isFreezing,

    // Actions
    startFreeze,
    updateFreeze,
    endFreeze,
    cancelFreeze,
    setFreezeCount,
    freezeColumn,
    unfreezeColumn,

    // Queries
    isColumnFrozen,
    isCellInFrozenRegion,
    getFrozenColumnsRange,
    getUnfrozenColumnsRange,
    canFreeze,
  };
}

/**
 * Validate freeze count
 */
function isValidFreezeCount(
  count: number,
  maxFreezeCount: number,
  minUnfrozenCount: number,
  totalColumns?: number
): boolean {
  if (count < 0 || count > maxFreezeCount) {
    return false;
  }

  if (totalColumns !== undefined) {
    const unfrozenCount = totalColumns - count;
    if (unfrozenCount < minUnfrozenCount) {
      return false;
    }
  }

  return true;
}

/**
 * Get freeze indicator position
 */
export function getFreezeIndicatorPosition(
  freezeColumnCount: number,
  getColumnOffset: (index: number) => number,
  getColumnWidth: (index: number) => number
): number {
  if (freezeColumnCount <= 0) return 0;
  
  const lastFrozenIndex = freezeColumnCount - 1;
  const offset = getColumnOffset(lastFrozenIndex);
  const width = getColumnWidth(lastFrozenIndex);
  
  return offset + width;
}

/**
 * Check if position is near freeze boundary
 */
export function isNearFreezeBoundary(
  x: number,
  freezeColumnCount: number,
  getColumnOffset: (index: number) => number,
  getColumnWidth: (index: number) => number,
  threshold = 5
): boolean {
  if (freezeColumnCount <= 0) return false;
  
  const boundaryX = getFreezeIndicatorPosition(freezeColumnCount, getColumnOffset, getColumnWidth);
  return Math.abs(x - boundaryX) <= threshold;
}
