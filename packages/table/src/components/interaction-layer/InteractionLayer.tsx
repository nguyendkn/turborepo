import React, { useCallback, useRef, useState, useEffect } from 'react';
import type { CellPosition } from '../../types/cell';
import type { ScrollState, Position } from '../../types/interaction';
import type { CombinedSelection } from '../../types/selection';
import type { GridColumn } from '../../types/grid';
import { CoordinateManager } from '../../managers/coordinate-manager';
import { SelectionManager } from '../../managers/selection-manager';
import { AdvancedSelectionManager } from '../../managers/advanced-selection-manager';
import { cn } from '../../utils/cn';

/**
 * Mouse state interface
 */
export interface MouseState {
  x: number;
  y: number;
  isDown: boolean;
  button: number;
  target: 'cell' | 'header' | 'rowHeader' | 'none';
  cellPosition?: CellPosition;
}

/**
 * Interaction layer props
 */
export interface InteractionLayerProps {
  /** Container width */
  width: number;
  /** Container height */
  height: number;
  /** Grid columns */
  columns: GridColumn[];
  /** Row count */
  rowCount: number;
  /** Coordinate manager */
  coordinateManager: CoordinateManager;
  /** Selection manager */
  selectionManager: SelectionManager;
  /** Advanced selection manager (optional) */
  advancedSelectionManager?: AdvancedSelectionManager;
  /** Current scroll state */
  scrollState: ScrollState;
  /** Current selection */
  selection: CombinedSelection;
  /** Active cell */
  activeCell: CellPosition | null;
  /** Whether multi-selection is enabled */
  multiSelect?: boolean;
  /** Whether dragging is enabled */
  draggable?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Selection change handler */
  onSelectionChange?: (selection: CombinedSelection) => void;
  /** Active cell change handler */
  onActiveCellChange?: (cell: CellPosition | null) => void;
  /** Cell click handler */
  onCellClick?: (position: CellPosition, event: React.MouseEvent) => void;
  /** Cell double click handler */
  onCellDoubleClick?: (position: CellPosition, event: React.MouseEvent) => void;
  /** Context menu handler */
  onContextMenu?: (position: CellPosition, event: React.MouseEvent) => void;
}

/**
 * InteractionLayer - Handles all user interactions for the grid
 * 
 * Features:
 * - Mouse interactions (click, drag, hover)
 * - Keyboard navigation
 * - Selection management
 * - Context menu support
 * - Touch support (basic)
 */
export function InteractionLayer({
  width,
  height,
  columns,
  rowCount,
  coordinateManager,
  selectionManager,
  advancedSelectionManager,
  scrollState,
  selection,
  activeCell,
  multiSelect = true,
  draggable = true,
  className,
  onSelectionChange,
  onActiveCellChange,
  onCellClick,
  onCellDoubleClick,
  onContextMenu,
}: InteractionLayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouseState, setMouseState] = useState<MouseState>({
    x: 0,
    y: 0,
    isDown: false,
    button: 0,
    target: 'none',
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<CellPosition | null>(null);

  // Get cell position from mouse coordinates
  const getCellFromMouse = useCallback((clientX: number, clientY: number): CellPosition | null => {
    if (!containerRef.current) return null;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left + scrollState.scrollLeft;
    const y = clientY - rect.top + scrollState.scrollTop;

    return coordinateManager.getCellFromCoordinates(x, y);
  }, [coordinateManager, scrollState]);

  // Determine interaction target
  const getInteractionTarget = useCallback((position: CellPosition): MouseState['target'] => {
    const [col, row] = position;
    
    if (row < 0) return 'header';
    if (col < 0) return 'rowHeader';
    return 'cell';
  }, []);

  // Mouse event handlers
  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const cellPosition = getCellFromMouse(event.clientX, event.clientY);
    if (!cellPosition) return;

    const target = getInteractionTarget(cellPosition);
    const newMouseState: MouseState = {
      x: event.clientX,
      y: event.clientY,
      isDown: true,
      button: event.button,
      target,
      cellPosition,
    };

    setMouseState(newMouseState);

    // Handle different interaction types
    switch (target) {
      case 'cell':
        // Start cell selection
        if (event.button === 0) { // Left click
          const isExtend = event.shiftKey;
          const isToggle = event.ctrlKey || event.metaKey;

          if (advancedSelectionManager) {
            // Use advanced selection with multi-select support
            advancedSelectionManager.selectCellAdvanced(cellPosition, isExtend, isToggle);
            onSelectionChange?.(advancedSelectionManager.getState().selection);
          } else {
            // Fallback to basic selection
            selectionManager.selectCell(cellPosition);
            onSelectionChange?.(selectionManager.getState().selection);
          }

          onActiveCellChange?.(cellPosition);
          setDragStart(cellPosition);
        }
        break;

      case 'header':
        // Column selection
        if (event.button === 0) {
          const [col] = cellPosition;
          selectionManager.selectColumn(col);
          onSelectionChange?.(selectionManager.getState().selection);
        }
        break;

      case 'rowHeader':
        // Row selection
        if (event.button === 0) {
          const [, row] = cellPosition;
          selectionManager.selectRow(row);
          onSelectionChange?.(selectionManager.getState().selection);
        }
        break;
    }

    // Trigger click handler
    if (target === 'cell') {
      onCellClick?.(cellPosition, event);
    }

    event.preventDefault();
  }, [
    getCellFromMouse,
    getInteractionTarget,
    selectionManager,
    activeCell,
    multiSelect,
    onActiveCellChange,
    onSelectionChange,
    onCellClick,
  ]);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const cellPosition = getCellFromMouse(event.clientX, event.clientY);
    if (!cellPosition) return;

    // Update mouse state
    setMouseState(prev => ({
      ...prev,
      x: event.clientX,
      y: event.clientY,
      cellPosition,
    }));

    // Handle drag selection
    if (mouseState.isDown && dragStart && !isDragging) {
      const distance = Math.sqrt(
        Math.pow(event.clientX - mouseState.x, 2) + 
        Math.pow(event.clientY - mouseState.y, 2)
      );
      
      if (distance > 5) { // Drag threshold
        setIsDragging(true);
      }
    }

    if (isDragging && dragStart) {
      // Update selection during drag (simplified)
      selectionManager.selectCell(cellPosition);
      onSelectionChange?.(selectionManager.getState().selection);
    }
  }, [
    getCellFromMouse,
    mouseState.isDown,
    mouseState.x,
    mouseState.y,
    dragStart,
    isDragging,
    selectionManager,
    onSelectionChange,
  ]);

  const handleMouseUp = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    // Reset mouse state
    setMouseState(prev => ({
      ...prev,
      isDown: false,
    }));
    
    setIsDragging(false);
    setDragStart(null);

    event.preventDefault();
  }, []);

  const handleDoubleClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const cellPosition = getCellFromMouse(event.clientX, event.clientY);
    if (!cellPosition) return;

    const target = getInteractionTarget(cellPosition);
    if (target === 'cell') {
      onCellDoubleClick?.(cellPosition, event);
    }

    event.preventDefault();
  }, [getCellFromMouse, getInteractionTarget, onCellDoubleClick]);

  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const cellPosition = getCellFromMouse(event.clientX, event.clientY);
    if (!cellPosition) return;

    const target = getInteractionTarget(cellPosition);
    if (target === 'cell') {
      onContextMenu?.(cellPosition, event);
    }

    event.preventDefault();
  }, [getCellFromMouse, getInteractionTarget, onContextMenu]);

  // Keyboard event handlers
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!activeCell) return;

    const [col, row] = activeCell;
    let newPosition: CellPosition | null = null;

    switch (event.key) {
      case 'ArrowUp':
        newPosition = [col, Math.max(0, row - 1)];
        break;
      case 'ArrowDown':
        newPosition = [col, Math.min(rowCount - 1, row + 1)];
        break;
      case 'ArrowLeft':
        newPosition = [Math.max(0, col - 1), row];
        break;
      case 'ArrowRight':
        newPosition = [Math.min(columns.length - 1, col + 1), row];
        break;
      case 'Home':
        newPosition = [0, row];
        break;
      case 'End':
        newPosition = [columns.length - 1, row];
        break;
      case 'PageUp':
        newPosition = [col, Math.max(0, row - 10)];
        break;
      case 'PageDown':
        newPosition = [col, Math.min(rowCount - 1, row + 10)];
        break;
      case 'Escape':
        selectionManager.clearSelection();
        onSelectionChange?.(null);
        onActiveCellChange?.(null);
        break;
      case 'a':
        if (event.ctrlKey || event.metaKey) {
          selectionManager.selectAll();
          onSelectionChange?.(selectionManager.getState().selection);
          event.preventDefault();
        }
        break;
    }

    if (newPosition) {
      const isExtend = event.shiftKey;
      
      // Simplified selection for now
      selectionManager.selectCell(newPosition);
      
      onActiveCellChange?.(newPosition);
      onSelectionChange?.(selectionManager.getState().selection);
      event.preventDefault();
    }
  }, [
    activeCell,
    rowCount,
    columns.length,
    selectionManager,
    onActiveCellChange,
    onSelectionChange,
  ]);

  // Focus management
  const handleFocus = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, []);

  // Auto-focus on mount
  useEffect(() => {
    handleFocus();
  }, [handleFocus]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'absolute inset-0 outline-none cursor-cell',
        'focus:outline-none focus:ring-0',
        className
      )}
      style={{ width, height }}
      tabIndex={0}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
    />
  );
}
