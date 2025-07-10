import type { CellPosition } from '../types/cell';
import type { TableTheme } from '../types/theme';
import type { GridColumn } from '../types/grid';
import { CoordinateManager } from '../managers/coordinate-manager';
import { drawRect, drawText, drawLine } from './base-renderer';
import { CellRendererRegistry, type CellContent, type CellRenderContext } from './cell-renderers';

/**
 * Visible region interface
 */
export interface VisibleRegion {
  startRowIndex: number;
  stopRowIndex: number;
  startColumnIndex: number;
  stopColumnIndex: number;
}

/**
 * Render options interface
 */
export interface RenderOptions {
  scrollLeft: number;
  scrollTop: number;
  containerWidth: number;
  containerHeight: number;
  theme: TableTheme;
  selection?: {
    ranges: Array<[number, number, number, number]>;
    activeCell?: CellPosition;
  };
  hoveredCell?: CellPosition;
  editingCell?: CellPosition;
}

/**
 * Layout renderer for grid canvas rendering
 * Based on teable's RenderLayer for high-performance grid rendering
 */
export class LayoutRenderer {
  private coordinateManager: CoordinateManager;
  private cellRendererRegistry: CellRendererRegistry;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(
    canvas: HTMLCanvasElement,
    coordinateManager: CoordinateManager,
    cellRendererRegistry?: CellRendererRegistry
  ) {
    this.canvas = canvas;
    this.coordinateManager = coordinateManager;
    this.cellRendererRegistry = cellRendererRegistry || new CellRendererRegistry();
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context from canvas');
    }
    this.ctx = ctx;
  }

  /**
   * Render the entire grid
   */
  render(
    columns: GridColumn[],
    getCellContent: (position: CellPosition) => CellContent,
    options: RenderOptions
  ): void {
    const { scrollLeft, scrollTop, containerWidth, containerHeight, theme } = options;

    // Clear canvas
    this.clearCanvas(containerWidth, containerHeight);

    // Calculate visible region
    const visibleRegion = this.calculateVisibleRegion(scrollLeft, scrollTop);

    // Render cells
    this.renderCells(columns, getCellContent, visibleRegion, options);

    // Render headers
    this.renderHeaders(columns, options);

    // Render selection
    if (options.selection) {
      this.renderSelection(options.selection, options);
    }

    // Render grid lines
    this.renderGridLines(visibleRegion, options);
  }

  /**
   * Clear the canvas
   */
  private clearCanvas(width: number, height: number): void {
    this.ctx.clearRect(0, 0, width, height);
  }

  /**
   * Calculate visible region for virtualization
   */
  private calculateVisibleRegion(scrollLeft: number, scrollTop: number): VisibleRegion {
    const startRowIndex = this.coordinateManager.getRowStartIndex(scrollTop);
    const stopRowIndex = this.coordinateManager.getRowStopIndex(startRowIndex, scrollTop);
    const startColumnIndex = this.coordinateManager.getColumnStartIndex(scrollLeft);
    const stopColumnIndex = this.coordinateManager.getColumnStopIndex(startColumnIndex, scrollLeft);

    return {
      startRowIndex,
      stopRowIndex,
      startColumnIndex,
      stopColumnIndex,
    };
  }

  /**
   * Render data cells
   */
  private renderCells(
    columns: GridColumn[],
    getCellContent: (position: CellPosition) => CellContent,
    visibleRegion: VisibleRegion,
    options: RenderOptions
  ): void {
    const { theme, selection, hoveredCell, editingCell, scrollLeft } = options;
    const { startRowIndex, stopRowIndex, startColumnIndex, stopColumnIndex } = visibleRegion;

    for (let rowIndex = startRowIndex; rowIndex <= stopRowIndex; rowIndex++) {
      for (let colIndex = startColumnIndex; colIndex <= stopColumnIndex; colIndex++) {
        if (colIndex >= columns.length) continue;

        const position: CellPosition = [colIndex, rowIndex];
        const column = columns[colIndex];
        const cellContent = getCellContent(position);

        // Calculate cell bounds
        const x = this.coordinateManager.getColumnRelativeOffset(colIndex, scrollLeft);
        const y = this.coordinateManager.getRowOffset(rowIndex);
        const width = this.coordinateManager.getColumnWidth(colIndex);
        const height = this.coordinateManager.getRowHeight(rowIndex);

        // Check cell states
        const isSelected = this.isCellSelected(position, selection);
        const isActive = this.isCellActive(position, selection?.activeCell);
        const isHovered = this.isCellHovered(position, hoveredCell);
        const isEditing = this.isCellEditing(position, editingCell);

        // Create render context
        const context: CellRenderContext = {
          ctx: this.ctx,
          x,
          y,
          width,
          height,
          theme,
          isSelected,
          isActive,
          isHovered,
          isEditing,
          position,
        };

        // Get appropriate renderer
        const renderer = this.cellRendererRegistry.getOrDefault(cellContent.type);
        
        // Render cell
        renderer.render(context, cellContent);
      }
    }
  }

  /**
   * Render column headers
   */
  private renderHeaders(columns: GridColumn[], options: RenderOptions): void {
    const { theme, scrollLeft } = options;
    const headerHeight = this.coordinateManager.rowInitSize;

    if (headerHeight <= 0) return;

    // Draw header background
    drawRect(this.ctx, {
      x: 0,
      y: 0,
      width: this.coordinateManager.containerWidth,
      height: headerHeight,
      fill: theme.colors.muted,
      stroke: theme.colors.border,
      strokeWidth: 1,
    });

    // Render header cells
    for (let colIndex = 0; colIndex < columns.length; colIndex++) {
      const column = columns[colIndex];
      if (!column) continue;

      const x = this.coordinateManager.getColumnRelativeOffset(colIndex, scrollLeft);
      const width = this.coordinateManager.getColumnWidth(colIndex);

      // Skip if column is not visible
      if (x + width < 0 || x > this.coordinateManager.containerWidth) {
        continue;
      }

      // Draw header cell
      this.renderHeaderCell(column, x, 0, width, headerHeight, theme);
    }
  }

  /**
   * Render individual header cell
   */
  private renderHeaderCell(
    column: GridColumn,
    x: number,
    y: number,
    width: number,
    height: number,
    theme: TableTheme
  ): void {
    // Draw header background
    drawRect(this.ctx, {
      x,
      y,
      width,
      height,
      fill: theme.colors.secondary,
      stroke: theme.colors.border,
      strokeWidth: 1,
    });

    // Draw header text
    const padding = 8;
    const textX = x + padding;
    const textY = y + height / 2;
    const maxWidth = width - padding * 2;

    if (maxWidth > 0) {
      drawText(this.ctx, {
        x: textX,
        y: textY,
        text: column.name,
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.foreground,
        baseline: 'middle',
        maxWidth,
      });
    }
  }

  /**
   * Render selection overlay
   */
  private renderSelection(
    selection: { ranges: Array<[number, number, number, number]>; activeCell?: CellPosition },
    options: RenderOptions
  ): void {
    const { theme, scrollLeft } = options;

    // Render selection ranges
    selection.ranges.forEach(range => {
      const [startCol, startRow, endCol, endRow] = range;
      
      const x = this.coordinateManager.getColumnRelativeOffset(startCol, scrollLeft);
      const y = this.coordinateManager.getRowOffset(startRow);
      const width = this.coordinateManager.getColumnOffset(endCol + 1) - this.coordinateManager.getColumnOffset(startCol);
      const height = this.coordinateManager.getRowOffset(endRow + 1) - this.coordinateManager.getRowOffset(startRow);

      // Draw selection background
      this.ctx.save();
      this.ctx.globalAlpha = 0.1;
      drawRect(this.ctx, {
        x,
        y,
        width,
        height,
        fill: theme.colors.primary,
      });
      this.ctx.restore();

      // Draw selection border
      drawRect(this.ctx, {
        x,
        y,
        width,
        height,
        stroke: theme.colors.primary,
        strokeWidth: 2,
      });
    });

    // Render active cell
    if (selection.activeCell) {
      const [col, row] = selection.activeCell;
      const x = this.coordinateManager.getColumnRelativeOffset(col, scrollLeft);
      const y = this.coordinateManager.getRowOffset(row);
      const width = this.coordinateManager.getColumnWidth(col);
      const height = this.coordinateManager.getRowHeight(row);

      // Draw active cell border
      drawRect(this.ctx, {
        x: x + 1,
        y: y + 1,
        width: width - 2,
        height: height - 2,
        stroke: theme.colors.primary,
        strokeWidth: 3,
      });
    }
  }

  /**
   * Render grid lines
   */
  private renderGridLines(visibleRegion: VisibleRegion, options: RenderOptions): void {
    const { theme, scrollLeft } = options;
    const { startRowIndex, stopRowIndex, startColumnIndex, stopColumnIndex } = visibleRegion;

    // Draw vertical lines (columns)
    for (let colIndex = startColumnIndex; colIndex <= stopColumnIndex + 1; colIndex++) {
      const x = this.coordinateManager.getColumnRelativeOffset(colIndex, scrollLeft);
      
      drawLine(this.ctx, {
        x1: x,
        y1: 0,
        x2: x,
        y2: this.coordinateManager.containerHeight,
        color: theme.colors.border,
        width: 1,
      });
    }

    // Draw horizontal lines (rows)
    for (let rowIndex = startRowIndex; rowIndex <= stopRowIndex + 1; rowIndex++) {
      const y = this.coordinateManager.getRowOffset(rowIndex);
      
      drawLine(this.ctx, {
        x1: 0,
        y1: y,
        x2: this.coordinateManager.containerWidth,
        y2: y,
        color: theme.colors.border,
        width: 1,
      });
    }
  }

  /**
   * Check if cell is selected
   */
  private isCellSelected(
    position: CellPosition,
    selection?: { ranges: Array<[number, number, number, number]> }
  ): boolean {
    if (!selection) return false;

    const [col, row] = position;
    return selection.ranges.some(range => {
      const [startCol, startRow, endCol, endRow] = range;
      return col >= startCol && col <= endCol && row >= startRow && row <= endRow;
    });
  }

  /**
   * Check if cell is active
   */
  private isCellActive(position: CellPosition, activeCell?: CellPosition): boolean {
    if (!activeCell) return false;
    return position[0] === activeCell[0] && position[1] === activeCell[1];
  }

  /**
   * Check if cell is hovered
   */
  private isCellHovered(position: CellPosition, hoveredCell?: CellPosition): boolean {
    if (!hoveredCell) return false;
    return position[0] === hoveredCell[0] && position[1] === hoveredCell[1];
  }

  /**
   * Check if cell is being edited
   */
  private isCellEditing(position: CellPosition, editingCell?: CellPosition): boolean {
    if (!editingCell) return false;
    return position[0] === editingCell[0] && position[1] === editingCell[1];
  }

  /**
   * Update coordinate manager
   */
  updateCoordinateManager(coordinateManager: CoordinateManager): void {
    this.coordinateManager = coordinateManager;
  }

  /**
   * Get cell renderer registry
   */
  getCellRendererRegistry(): CellRendererRegistry {
    return this.cellRendererRegistry;
  }
}
