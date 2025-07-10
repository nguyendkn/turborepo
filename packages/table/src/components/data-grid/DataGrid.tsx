import React, { useRef, useEffect, useCallback, useState } from 'react';
import type { GridProps, GridRef } from '../../types/grid';
import type { CellPosition } from '../../types/cell';
import type { CombinedSelection } from '../../types/selection';
import type { ScrollState } from '../../types/interaction';
import { CoordinateManager, type CoordinateConfig } from '../../managers/coordinate-manager';
import { SelectionManager } from '../../managers/selection-manager';
import { ThemeManager } from '../../managers/theme-manager';
import { SpriteManager } from '../../managers/sprite-manager';
import { ImageManager } from '../../managers/image-manager';
import { LayoutRenderer } from '../../renderers/layout-renderer';
import { CellRendererRegistry } from '../../renderers/cell-renderers';
import { defaultThemeConfig } from '../../configs/theme';
import { cn } from '../../utils/cn';

export interface DataGridProps extends Partial<GridProps> {
  /** Additional CSS class name */
  className?: string;
  /** Container width */
  width?: number;
  /** Container height */
  height?: number;
}

/**
 * DataGrid - Advanced grid component with canvas rendering
 *
 * Features:
 * - Canvas-based rendering for performance
 * - Complex interactions and selections
 * - Collaborative editing support
 * - Advanced virtualization
 * - Real-time collaboration
 */
export const DataGrid = React.forwardRef<GridRef, DataGridProps>((props, ref) => {
  const {
    className,
    columns = [],
    rowCount = 0,
    width = 800,
    height = 600,
    rowHeight = 40,
    columnHeaderHeight = 40,
    freezeColumnCount = 1,
    getCellContent,
    theme,
    customIcons = {},
    ...restProps
  } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Managers
  const [coordinateManager, setCoordinateManager] = useState<CoordinateManager | null>(null);
  const [selectionManager, setSelectionManager] = useState<SelectionManager | null>(null);
  const [themeManager, setThemeManager] = useState<ThemeManager | null>(null);
  const [spriteManager, setSpriteManager] = useState<SpriteManager | null>(null);
  const [imageManager, setImageManager] = useState<ImageManager | null>(null);
  const [layoutRenderer, setLayoutRenderer] = useState<LayoutRenderer | null>(null);

  // State
  const [scrollState, setScrollState] = useState<ScrollState>({
    scrollLeft: 0,
    scrollTop: 0,
    isScrolling: false,
  });
  const [selection, setSelection] = useState<CombinedSelection>(null);
  const [activeCell, setActiveCell] = useState<CellPosition | null>(null);
  const [hoveredCell, setHoveredCell] = useState<CellPosition | null>(null);
  const [editingCell, setEditingCell] = useState<CellPosition | null>(null);

  // Initialize managers
  useEffect(() => {
    if (!canvasRef.current) return;

    // Create coordinate manager
    const coordinateConfig: CoordinateConfig = {
      rowCount,
      pureRowCount: rowCount,
      columnCount: columns.length,
      containerWidth: width,
      containerHeight: height,
      rowHeight: rowHeight || 40,
      columnWidth: 120, // Default column width
      rowInitSize: columnHeaderHeight || 40,
      columnInitSize: 0,
      freezeColumnCount: freezeColumnCount || 1,
    };

    const coordManager = new CoordinateManager(coordinateConfig);
    setCoordinateManager(coordManager);

    // Create selection manager
    const selManager = new SelectionManager(
      {
        selection: null,
        activeCell: null,
        multiSelect: true,
        anchor: null,
      },
      columns.length,
      rowCount
    );
    setSelectionManager(selManager);

    // Create theme manager
    const themeConfig = theme ? { ...defaultThemeConfig, custom: theme } : defaultThemeConfig;
    const themeMan = new ThemeManager(themeConfig);
    setThemeManager(themeMan);

    // Create sprite manager
    const spriteMan = new SpriteManager({ sprites: customIcons });
    setSpriteManager(spriteMan);

    // Create image manager
    const imageMan = new ImageManager();
    setImageManager(imageMan);

    // Create layout renderer
    const cellRendererRegistry = new CellRendererRegistry();
    const renderer = new LayoutRenderer(canvasRef.current, coordManager, cellRendererRegistry);
    setLayoutRenderer(renderer);

  }, [columns.length, rowCount, width, height, rowHeight, columnHeaderHeight, freezeColumnCount, theme, customIcons]);

  // Adapter function to convert Cell to CellContent
  const getCellContentAdapter = useCallback((position: CellPosition) => {
    if (!getCellContent) {
      return { type: 'text', data: '', displayValue: '' };
    }

    const cell = getCellContent(position);
    return {
      type: cell.type || 'text',
      data: cell.value,
      displayValue: typeof cell.displayValue === 'string'
        ? cell.displayValue
        : String(cell.value || ''),
      readonly: cell.readonly,
      error: cell.error,
    };
  }, [getCellContent]);

  // Render grid
  const renderGrid = useCallback(() => {
    if (!layoutRenderer || !coordinateManager || !themeManager || !getCellContent) return;

    const currentTheme = themeManager.getCurrentTheme();

    layoutRenderer.render(columns, getCellContentAdapter, {
      scrollLeft: scrollState.scrollLeft,
      scrollTop: scrollState.scrollTop,
      containerWidth: width,
      containerHeight: height,
      theme: currentTheme,
      selection: selection ? {
        ranges: selection.ranges as Array<[number, number, number, number]>,
        activeCell: activeCell || undefined,
      } : undefined,
      hoveredCell: hoveredCell || undefined,
      editingCell: editingCell || undefined,
    });
  }, [
    layoutRenderer,
    coordinateManager,
    themeManager,
    getCellContent,
    columns,
    scrollState,
    width,
    height,
    selection,
    activeCell,
    hoveredCell,
    editingCell,
  ]);

  // Render on state changes
  useEffect(() => {
    renderGrid();
  }, [renderGrid]);

  // Handle scroll
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    setScrollState({
      scrollLeft: target.scrollLeft,
      scrollTop: target.scrollTop,
      isScrolling: true,
    });
  }, []);

  // Handle mouse events
  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!coordinateManager) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left + scrollState.scrollLeft;
    const y = event.clientY - rect.top + scrollState.scrollTop;

    const cellPosition = coordinateManager.getCellFromCoordinates(x, y);
    if (cellPosition && selectionManager) {
      selectionManager.selectCell(cellPosition);
      setSelection(selectionManager.getState().selection);
      setActiveCell(cellPosition);
    }
  }, [coordinateManager, selectionManager, scrollState]);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!coordinateManager) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left + scrollState.scrollLeft;
    const y = event.clientY - rect.top + scrollState.scrollTop;

    const cellPosition = coordinateManager.getCellFromCoordinates(x, y);
    setHoveredCell(cellPosition);
  }, [coordinateManager, scrollState]);

  // Expose ref methods
  React.useImperativeHandle(ref, () => ({
    resetState: () => {
      setSelection(null);
      setActiveCell(null);
      setHoveredCell(null);
      setEditingCell(null);
    },
    forceUpdate: () => {
      renderGrid();
    },
    getActiveCell: () => activeCell,
    getRowOffset: (rowIndex: number) => coordinateManager?.getRowOffset(rowIndex) || 0,
    setSelection: (newSelection: CombinedSelection) => {
      setSelection(newSelection);
      if (selectionManager) {
        selectionManager.setSelection(newSelection);
      }
    },
    getScrollState: () => scrollState,
    scrollBy: (deltaX: number, deltaY: number) => {
      if (containerRef.current) {
        containerRef.current.scrollLeft += deltaX;
        containerRef.current.scrollTop += deltaY;
      }
    },
    scrollTo: (scrollLeft?: number, scrollTop?: number) => {
      if (containerRef.current) {
        if (scrollLeft !== undefined) containerRef.current.scrollLeft = scrollLeft;
        if (scrollTop !== undefined) containerRef.current.scrollTop = scrollTop;
      }
    },
    scrollToItem: (position: [number, number]) => {
      if (!coordinateManager || !containerRef.current) return;

      const [col, row] = position;
      const x = coordinateManager.getColumnOffset(col);
      const y = coordinateManager.getRowOffset(row);

      containerRef.current.scrollLeft = x;
      containerRef.current.scrollTop = y;
    },
    getCellIndicesAtPosition: (x: number, y: number) => {
      return coordinateManager?.getCellFromCoordinates(x, y) || null;
    },
    getContainer: () => containerRef.current,
    getCellBounds: (cell: CellPosition) => {
      return coordinateManager?.getCellBounds(cell) || null;
    },
    setCellLoading: (cells: CellPosition[]) => {
      // TODO: Implement cell loading state
    },
    setColumnLoadings: (columnLoadings: Array<{ columnId: string; loading: boolean }>) => {
      // TODO: Implement column loading state
    },
    isEditing: () => editingCell !== null,
  }), [
    activeCell,
    scrollState,
    coordinateManager,
    selectionManager,
    editingCell,
    renderGrid,
  ]);

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-auto', className)}
      style={{ width, height }}
      onScroll={handleScroll}
      {...restProps}
    >
      <canvas
        ref={canvasRef}
        width={coordinateManager?.getTotalWidth() || width}
        height={coordinateManager?.getTotalHeight() || height}
        className="block"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        style={{
          cursor: 'cell',
        }}
      />
    </div>
  );
});

DataGrid.displayName = 'DataGrid';
