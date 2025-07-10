import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { CellPosition } from '../../types/cell';
import type { Position } from '../../types/interaction';
import { cn } from '../../utils/cn';

/**
 * Context menu item interface
 */
export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  separator?: boolean;
  shortcut?: string;
  submenu?: ContextMenuItem[];
  onClick?: (position: CellPosition) => void;
}

/**
 * Context menu props
 */
export interface ContextMenuProps {
  /** Whether the menu is visible */
  visible: boolean;
  /** Menu position */
  position: Position;
  /** Cell position that triggered the menu */
  cellPosition: CellPosition | null;
  /** Menu items */
  items: ContextMenuItem[];
  /** Additional CSS class */
  className?: string;
  /** Close handler */
  onClose: () => void;
  /** Item click handler */
  onItemClick?: (item: ContextMenuItem, position: CellPosition) => void;
}

/**
 * ContextMenu - Right-click context menu for grid cells
 * 
 * Features:
 * - Keyboard navigation
 * - Submenu support
 * - Separator support
 * - Shortcut display
 * - Auto-positioning
 */
export function ContextMenu({
  visible,
  position,
  cellPosition,
  items,
  className,
  onClose,
  onItemClick,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Adjust menu position to stay within viewport
  const adjustPosition = useCallback(() => {
    if (!menuRef.current || !visible) return;

    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    let { x, y } = position;

    // Adjust horizontal position
    if (x + rect.width > viewport.width) {
      x = viewport.width - rect.width - 10;
    }
    if (x < 0) {
      x = 10;
    }

    // Adjust vertical position
    if (y + rect.height > viewport.height) {
      y = viewport.height - rect.height - 10;
    }
    if (y < 0) {
      y = 10;
    }

    setAdjustedPosition({ x, y });
  }, [position, visible]);

  // Handle item click
  const handleItemClick = useCallback((item: ContextMenuItem, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (item.disabled || item.separator) return;

    if (cellPosition) {
      item.onClick?.(cellPosition);
      onItemClick?.(item, cellPosition);
    }

    onClose();
  }, [cellPosition, onItemClick, onClose]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    const enabledItems = items.filter(item => !item.disabled && !item.separator);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setActiveIndex(prev => {
          const nextIndex = prev + 1;
          return nextIndex >= enabledItems.length ? 0 : nextIndex;
        });
        break;

      case 'ArrowUp':
        event.preventDefault();
        setActiveIndex(prev => {
          const nextIndex = prev - 1;
          return nextIndex < 0 ? enabledItems.length - 1 : nextIndex;
        });
        break;

      case 'Enter':
        event.preventDefault();
        if (activeIndex >= 0 && activeIndex < enabledItems.length) {
          const item = enabledItems[activeIndex];
          if (cellPosition && item) {
            item.onClick?.(cellPosition);
            onItemClick?.(item, cellPosition);
          }
          onClose();
        }
        break;

      case 'Escape':
        event.preventDefault();
        onClose();
        break;
    }
  }, [items, activeIndex, cellPosition, onItemClick, onClose]);

  // Handle click outside
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      onClose();
    }
  }, [onClose]);

  // Adjust position when visible
  useEffect(() => {
    if (visible) {
      adjustPosition();
    }
  }, [visible, adjustPosition]);

  // Add/remove event listeners
  useEffect(() => {
    if (visible) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [visible, handleClickOutside]);

  // Focus menu when visible
  useEffect(() => {
    if (visible && menuRef.current) {
      menuRef.current.focus();
      setActiveIndex(-1);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      ref={menuRef}
      className={cn(
        'fixed z-50 min-w-48 bg-white border border-gray-200 rounded-md shadow-lg',
        'py-1 outline-none',
        'dark:bg-gray-800 dark:border-gray-700',
        className
      )}
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
      }}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      {items.map((item, index) => {
        if (item.separator) {
          return (
            <div
              key={`separator-${index}`}
              className="my-1 border-t border-gray-200 dark:border-gray-600"
            />
          );
        }

        const isActive = activeIndex === items.filter(i => !i.disabled && !i.separator).indexOf(item);

        return (
          <div
            key={item.id}
            className={cn(
              'flex items-center justify-between px-3 py-2 text-sm cursor-pointer',
              'hover:bg-gray-100 dark:hover:bg-gray-700',
              isActive && 'bg-gray-100 dark:bg-gray-700',
              item.disabled && 'opacity-50 cursor-not-allowed'
            )}
            onClick={(event) => handleItemClick(item, event)}
          >
            <div className="flex items-center space-x-2">
              {item.icon && (
                <span className="w-4 h-4 flex items-center justify-center">
                  {item.icon}
                </span>
              )}
              <span>{item.label}</span>
            </div>
            
            {item.shortcut && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {item.shortcut}
              </span>
            )}
            
            {item.submenu && (
              <span className="w-4 h-4 flex items-center justify-center">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Default context menu items for grid
 */
export const defaultContextMenuItems: ContextMenuItem[] = [
  {
    id: 'copy',
    label: 'Copy',
    shortcut: 'Ctrl+C',
    onClick: (position) => {
      console.log('Copy cell at', position);
    },
  },
  {
    id: 'paste',
    label: 'Paste',
    shortcut: 'Ctrl+V',
    onClick: (position) => {
      console.log('Paste to cell at', position);
    },
  },
  {
    id: 'separator-1',
    label: '',
    separator: true,
  },
  {
    id: 'cut',
    label: 'Cut',
    shortcut: 'Ctrl+X',
    onClick: (position) => {
      console.log('Cut cell at', position);
    },
  },
  {
    id: 'delete',
    label: 'Delete',
    shortcut: 'Del',
    onClick: (position) => {
      console.log('Delete cell at', position);
    },
  },
  {
    id: 'separator-2',
    label: '',
    separator: true,
  },
  {
    id: 'insert-row',
    label: 'Insert Row',
    onClick: (position) => {
      console.log('Insert row at', position);
    },
  },
  {
    id: 'insert-column',
    label: 'Insert Column',
    onClick: (position) => {
      console.log('Insert column at', position);
    },
  },
  {
    id: 'separator-3',
    label: '',
    separator: true,
  },
  {
    id: 'properties',
    label: 'Properties',
    onClick: (position) => {
      console.log('Show properties for cell at', position);
    },
  },
];
