import React, { useCallback, useRef, useState } from 'react';
import type { CellPosition } from '../../types/cell';
import type { ScrollState, Position } from '../../types/interaction';
import type { CombinedSelection } from '../../types/selection';
import { CoordinateManager } from '../../managers/coordinate-manager';
import { SelectionManager } from '../../managers/selection-manager';
import { cn } from '../../utils/cn';

/**
 * Touch state interface
 */
export interface TouchState {
  x: number;
  y: number;
  isActive: boolean;
  startTime: number;
  cellPosition?: CellPosition;
  gestureType: 'none' | 'tap' | 'longPress' | 'pan' | 'pinch';
}

/**
 * Touch gesture configuration
 */
export interface TouchGestureConfig {
  /** Long press duration in ms */
  longPressDuration?: number;
  /** Tap timeout in ms */
  tapTimeout?: number;
  /** Pan threshold in pixels */
  panThreshold?: number;
  /** Pinch threshold */
  pinchThreshold?: number;
}

/**
 * Touch layer props
 */
export interface TouchLayerProps {
  /** Container width */
  width: number;
  /** Container height */
  height: number;
  /** Coordinate manager */
  coordinateManager: CoordinateManager;
  /** Selection manager */
  selectionManager: SelectionManager;
  /** Current scroll state */
  scrollState: ScrollState;
  /** Current selection */
  selection: CombinedSelection;
  /** Active cell */
  activeCell: CellPosition | null;
  /** Touch gesture configuration */
  gestureConfig?: TouchGestureConfig;
  /** Additional CSS class */
  className?: string;
  /** Selection change handler */
  onSelectionChange?: (selection: CombinedSelection) => void;
  /** Active cell change handler */
  onActiveCellChange?: (cell: CellPosition | null) => void;
  /** Cell tap handler */
  onCellTap?: (position: CellPosition, event: React.TouchEvent) => void;
  /** Cell long press handler */
  onCellLongPress?: (position: CellPosition, event: React.TouchEvent) => void;
  /** Context menu handler */
  onContextMenu?: (position: CellPosition, event: React.TouchEvent) => void;
}

/**
 * TouchLayer - Handles touch interactions for mobile devices
 * 
 * Features:
 * - Touch gestures (tap, long press, pan, pinch)
 * - Touch selection
 * - Context menu support
 * - Scroll handling
 */
export function TouchLayer({
  width,
  height,
  coordinateManager,
  selectionManager,
  scrollState,
  selection,
  activeCell,
  gestureConfig = {},
  className,
  onSelectionChange,
  onActiveCellChange,
  onCellTap,
  onCellLongPress,
  onContextMenu,
}: TouchLayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout>();
  
  const {
    longPressDuration = 500,
    tapTimeout = 300,
    panThreshold = 10,
    pinchThreshold = 1.2,
  } = gestureConfig;

  const [touchState, setTouchState] = useState<TouchState>({
    x: 0,
    y: 0,
    isActive: false,
    startTime: 0,
    gestureType: 'none',
  });

  // Get cell position from touch coordinates
  const getCellFromTouch = useCallback((clientX: number, clientY: number): CellPosition | null => {
    if (!containerRef.current) return null;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left + scrollState.scrollLeft;
    const y = clientY - rect.top + scrollState.scrollTop;

    return coordinateManager.getCellFromCoordinates(x, y);
  }, [coordinateManager, scrollState]);

  // Clear long press timer
  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = undefined;
    }
  }, []);

  // Handle touch start
  const handleTouchStart = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 1) return; // Only handle single touch

    const touch = event.touches[0];
    if (!touch) return;

    const cellPosition = getCellFromTouch(touch.clientX, touch.clientY);
    if (!cellPosition) return;

    const newTouchState: TouchState = {
      x: touch.clientX,
      y: touch.clientY,
      isActive: true,
      startTime: Date.now(),
      cellPosition,
      gestureType: 'none',
    };

    setTouchState(newTouchState);

    // Start long press timer
    longPressTimerRef.current = setTimeout(() => {
      setTouchState(prev => ({ ...prev, gestureType: 'longPress' }));
      onCellLongPress?.(cellPosition, event);
      onContextMenu?.(cellPosition, event);
    }, longPressDuration);

    event.preventDefault();
  }, [
    getCellFromTouch,
    longPressDuration,
    onCellLongPress,
    onContextMenu,
  ]);

  // Handle touch move
  const handleTouchMove = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 1 || !touchState.isActive) return;

    const touch = event.touches[0];
    if (!touch) return;

    const deltaX = touch.clientX - touchState.x;
    const deltaY = touch.clientY - touchState.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Check if movement exceeds pan threshold
    if (distance > panThreshold && touchState.gestureType === 'none') {
      setTouchState(prev => ({ ...prev, gestureType: 'pan' }));
      clearLongPressTimer();
    }

    // Update touch position
    setTouchState(prev => ({
      ...prev,
      x: touch.clientX,
      y: touch.clientY,
    }));
  }, [touchState, panThreshold, clearLongPressTimer]);

  // Handle touch end
  const handleTouchEnd = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    if (!touchState.isActive) return;

    clearLongPressTimer();

    const duration = Date.now() - touchState.startTime;
    const { gestureType, cellPosition } = touchState;

    // Handle tap gesture
    if (gestureType === 'none' && duration < tapTimeout && cellPosition) {
      // Single tap - select cell
      selectionManager.selectCell(cellPosition);
      onActiveCellChange?.(cellPosition);
      onSelectionChange?.(selectionManager.getState().selection);
      onCellTap?.(cellPosition, event);
    }

    // Reset touch state
    setTouchState({
      x: 0,
      y: 0,
      isActive: false,
      startTime: 0,
      gestureType: 'none',
    });

    event.preventDefault();
  }, [
    touchState,
    tapTimeout,
    clearLongPressTimer,
    selectionManager,
    onActiveCellChange,
    onSelectionChange,
    onCellTap,
  ]);

  // Handle touch cancel
  const handleTouchCancel = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    clearLongPressTimer();
    setTouchState({
      x: 0,
      y: 0,
      isActive: false,
      startTime: 0,
      gestureType: 'none',
    });
  }, [clearLongPressTimer]);

  // Handle pinch gesture (for zoom)
  const handlePinchStart = useCallback((event: React.TouchEvent<HTMLDivElement>) => {
    if (event.touches.length === 2) {
      setTouchState(prev => ({ ...prev, gestureType: 'pinch' }));
      clearLongPressTimer();
    }
  }, [clearLongPressTimer]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      clearLongPressTimer();
    };
  }, [clearLongPressTimer]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'absolute inset-0 touch-none',
        'select-none user-select-none',
        className
      )}
      style={{ width, height }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    />
  );
}
