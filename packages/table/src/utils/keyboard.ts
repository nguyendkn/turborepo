import type { CellPosition } from '../types/cell';

/**
 * Key codes for keyboard navigation
 */
export const KeyCodes = {
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  SPACE: 'Space',
  DELETE: 'Delete',
  BACKSPACE: 'Backspace',
  HOME: 'Home',
  END: 'End',
  PAGE_UP: 'PageUp',
  PAGE_DOWN: 'PageDown',
  F2: 'F2',
  A: 'KeyA',
  C: 'KeyC',
  V: 'KeyV',
  X: 'KeyX',
  Z: 'KeyZ',
  Y: 'KeyY',
} as const;

/**
 * Check if key is navigation key
 */
export const isNavigationKey = (key: string): boolean => {
  return [
    KeyCodes.ARROW_UP,
    KeyCodes.ARROW_DOWN,
    KeyCodes.ARROW_LEFT,
    KeyCodes.ARROW_RIGHT,
    KeyCodes.HOME,
    KeyCodes.END,
    KeyCodes.PAGE_UP,
    KeyCodes.PAGE_DOWN,
    KeyCodes.TAB,
  ].includes(key as any);
};

/**
 * Check if key is editing key
 */
export const isEditingKey = (key: string): boolean => {
  return [
    KeyCodes.ENTER,
    KeyCodes.F2,
    KeyCodes.DELETE,
    KeyCodes.BACKSPACE,
  ].includes(key as any);
};

/**
 * Check if key combination is copy
 */
export const isCopyKey = (event: KeyboardEvent): boolean => {
  return (event.ctrlKey || event.metaKey) && event.code === KeyCodes.C;
};

/**
 * Check if key combination is paste
 */
export const isPasteKey = (event: KeyboardEvent): boolean => {
  return (event.ctrlKey || event.metaKey) && event.code === KeyCodes.V;
};

/**
 * Check if key combination is cut
 */
export const isCutKey = (event: KeyboardEvent): boolean => {
  return (event.ctrlKey || event.metaKey) && event.code === KeyCodes.X;
};

/**
 * Check if key combination is undo
 */
export const isUndoKey = (event: KeyboardEvent): boolean => {
  return (event.ctrlKey || event.metaKey) && event.code === KeyCodes.Z && !event.shiftKey;
};

/**
 * Check if key combination is redo
 */
export const isRedoKey = (event: KeyboardEvent): boolean => {
  return (
    (event.ctrlKey || event.metaKey) &&
    ((event.code === KeyCodes.Z && event.shiftKey) || event.code === KeyCodes.Y)
  );
};

/**
 * Check if key combination is select all
 */
export const isSelectAllKey = (event: KeyboardEvent): boolean => {
  return (event.ctrlKey || event.metaKey) && event.code === KeyCodes.A;
};

/**
 * Get next position based on keyboard navigation
 */
export const getNextPositionFromKey = (
  currentPosition: CellPosition,
  key: string,
  maxColumns: number,
  maxRows: number,
  shiftKey: boolean = false
): CellPosition => {
  const [col, row] = currentPosition;

  switch (key) {
    case KeyCodes.ARROW_UP:
      return [col, Math.max(0, row - 1)];
    
    case KeyCodes.ARROW_DOWN:
      return [col, Math.min(maxRows - 1, row + 1)];
    
    case KeyCodes.ARROW_LEFT:
      return [Math.max(0, col - 1), row];
    
    case KeyCodes.ARROW_RIGHT:
      return [Math.min(maxColumns - 1, col + 1), row];
    
    case KeyCodes.HOME:
      return shiftKey ? [0, 0] : [0, row];
    
    case KeyCodes.END:
      return shiftKey ? [maxColumns - 1, maxRows - 1] : [maxColumns - 1, row];
    
    case KeyCodes.PAGE_UP:
      return [col, Math.max(0, row - 10)]; // Move up 10 rows
    
    case KeyCodes.PAGE_DOWN:
      return [col, Math.min(maxRows - 1, row + 10)]; // Move down 10 rows
    
    case KeyCodes.TAB:
      if (shiftKey) {
        // Shift+Tab: move to previous cell
        if (col > 0) {
          return [col - 1, row];
        } else if (row > 0) {
          return [maxColumns - 1, row - 1];
        }
        return currentPosition;
      } else {
        // Tab: move to next cell
        if (col < maxColumns - 1) {
          return [col + 1, row];
        } else if (row < maxRows - 1) {
          return [0, row + 1];
        }
        return currentPosition;
      }
    
    case KeyCodes.ENTER:
      return [col, Math.min(maxRows - 1, row + 1)];
    
    default:
      return currentPosition;
  }
};

/**
 * Check if key should start editing
 */
export const shouldStartEditing = (event: KeyboardEvent): boolean => {
  const { key, ctrlKey, metaKey, altKey } = event;
  
  // Don't start editing for modifier keys or special combinations
  if (ctrlKey || metaKey || altKey) return false;
  
  // Don't start editing for navigation keys
  if (isNavigationKey(key)) return false;
  
  // Don't start editing for function keys
  if (key.startsWith('F') && key.length > 1) return false;
  
  // Start editing for F2
  if (key === KeyCodes.F2) return true;
  
  // Start editing for printable characters
  return key.length === 1 || key === KeyCodes.ENTER;
};

/**
 * Prevent default behavior for handled keys
 */
export const shouldPreventDefault = (event: KeyboardEvent): boolean => {
  const { key, ctrlKey, metaKey } = event;
  
  // Prevent default for navigation keys
  if (isNavigationKey(key)) return true;
  
  // Prevent default for keyboard shortcuts
  if (ctrlKey || metaKey) {
    return [KeyCodes.A, KeyCodes.C, KeyCodes.V, KeyCodes.X, KeyCodes.Z, KeyCodes.Y].includes(key as any);
  }
  
  // Prevent default for editing keys
  return [KeyCodes.ENTER, KeyCodes.ESCAPE, KeyCodes.DELETE].includes(key as any);
};
