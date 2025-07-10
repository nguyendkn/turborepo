import type { CellPosition } from '../types/cell';
import type { Position, Rectangle } from '../types/interaction';

/**
 * Cell metadata for caching
 */
export interface CellMetaData {
  size: number;
  offset: number;
}

/**
 * Cell metadata map
 */
export type CellMetaDataMap = Record<number, CellMetaData>;

/**
 * Indices map for dynamic sizing
 */
export type CoordinateIndicesMap = Record<number, number>;

/**
 * Item type for coordinate calculations
 */
export enum ItemType {
  Row = 'Row',
  Column = 'Column',
}

/**
 * Coordinate configuration interface
 */
export interface CoordinateConfig {
  rowCount: number;
  pureRowCount: number;
  columnCount: number;
  containerWidth: number;
  containerHeight: number;
  rowHeight: number;
  columnWidth: number;
  rowHeightMap?: CoordinateIndicesMap;
  columnWidthMap?: CoordinateIndicesMap;
  rowInitSize?: number;
  columnInitSize?: number;
  freezeColumnCount?: number;
}

/**
 * Advanced manager for coordinate calculations and transformations
 * Based on teable's CoordinateManager with metadata caching and performance optimizations
 */
export class CoordinateManager {
  protected defaultRowHeight: number;
  protected defaultColumnWidth: number;
  public pureRowCount: number;
  public rowCount: number;
  public columnCount: number;
  private _containerWidth: number;
  private _containerHeight: number;
  public rowHeightMap: CoordinateIndicesMap = {};
  public columnWidthMap: CoordinateIndicesMap = {};
  public rowInitSize: number;
  public columnInitSize: number;
  public lastRowIndex = -1;
  public lastColumnIndex = -1;
  public rowMetaDataMap: CellMetaDataMap = {};
  public columnMetaDataMap: CellMetaDataMap = {};
  private _freezeColumnCount: number;

  constructor(config: CoordinateConfig) {
    const {
      rowHeight,
      columnWidth,
      rowCount,
      pureRowCount,
      columnCount,
      containerWidth,
      containerHeight,
      rowInitSize = 0,
      columnInitSize = 0,
      rowHeightMap = {},
      columnWidthMap = {},
      freezeColumnCount = 1,
    } = config;

    this.defaultRowHeight = rowHeight;
    this.defaultColumnWidth = columnWidth;
    this.rowCount = rowCount;
    this.pureRowCount = pureRowCount;
    this.columnCount = columnCount;
    this.rowInitSize = rowInitSize;
    this.columnInitSize = columnInitSize;
    this._containerWidth = containerWidth;
    this._containerHeight = containerHeight;
    this.rowHeightMap = rowHeightMap;
    this.columnWidthMap = columnWidthMap;
    this._freezeColumnCount = freezeColumnCount;
  }

  /**
   * Get container dimensions
   */
  get containerWidth(): number {
    return this._containerWidth;
  }

  get containerHeight(): number {
    return this._containerHeight;
  }

  get freezeColumnCount(): number {
    return this._freezeColumnCount;
  }

  /**
   * Update container dimensions
   */
  setContainerSize(width: number, height: number): void {
    this._containerWidth = width;
    this._containerHeight = height;
  }

  /**
   * Update freeze column count
   */
  setFreezeColumnCount(count: number): void {
    this._freezeColumnCount = count;
  }

  /**
   * Get row height for specific index
   */
  getRowHeight(index: number): number {
    return this.rowHeightMap[index] ?? this.defaultRowHeight;
  }

  /**
   * Get column width for specific index
   */
  getColumnWidth(index: number): number {
    return this.columnWidthMap[index] ?? this.defaultColumnWidth;
  }

  /**
   * Get row offset (Y position)
   */
  getRowOffset(index: number): number {
    if (index <= this.lastRowIndex) {
      const metaData = this.rowMetaDataMap[index];
      if (metaData) {
        return metaData.offset;
      }
    }

    let offset = this.rowInitSize;
    for (let i = 0; i <= index; i++) {
      if (i === index) break;
      offset += this.getRowHeight(i);
    }

    // Cache the result
    this.rowMetaDataMap[index] = { size: this.getRowHeight(index), offset };
    this.lastRowIndex = Math.max(this.lastRowIndex, index);

    return offset;
  }

  /**
   * Get column offset (X position)
   */
  getColumnOffset(index: number): number {
    if (index <= this.lastColumnIndex) {
      const metaData = this.columnMetaDataMap[index];
      if (metaData) {
        return metaData.offset;
      }
    }

    let offset = this.columnInitSize;
    for (let i = 0; i <= index; i++) {
      if (i === index) break;
      offset += this.getColumnWidth(i);
    }

    // Cache the result
    this.columnMetaDataMap[index] = { size: this.getColumnWidth(index), offset };
    this.lastColumnIndex = Math.max(this.lastColumnIndex, index);

    return offset;
  }

  /**
   * Get column relative offset (considering freeze columns)
   */
  getColumnRelativeOffset(index: number, scrollLeft: number): number {
    const offset = this.getColumnOffset(index);
    if (index < this.freezeColumnCount) {
      return offset;
    }
    return offset - scrollLeft;
  }

  /**
   * Get row start index for virtualization
   */
  getRowStartIndex(scrollTop: number): number {
    const adjustedScrollTop = Math.max(0, scrollTop - this.rowInitSize);
    let index = 0;
    let currentOffset = 0;

    while (index < this.rowCount && currentOffset < adjustedScrollTop) {
      currentOffset += this.getRowHeight(index);
      index++;
    }

    return Math.max(0, index - 1);
  }

  /**
   * Get row stop index for virtualization
   */
  getRowStopIndex(startIndex: number, scrollTop: number): number {
    const adjustedScrollTop = Math.max(0, scrollTop - this.rowInitSize);
    const visibleHeight = this.containerHeight;
    let index = startIndex;
    let currentOffset = this.getRowOffset(startIndex);

    while (index < this.rowCount && currentOffset < adjustedScrollTop + visibleHeight) {
      currentOffset += this.getRowHeight(index);
      index++;
    }

    return Math.min(this.rowCount - 1, index);
  }

  /**
   * Get column start index for virtualization
   */
  getColumnStartIndex(scrollLeft: number): number {
    const adjustedScrollLeft = Math.max(0, scrollLeft - this.columnInitSize);
    let index = this.freezeColumnCount;
    let currentOffset = this.getColumnOffset(this.freezeColumnCount);

    while (index < this.columnCount && currentOffset < adjustedScrollLeft) {
      currentOffset += this.getColumnWidth(index);
      index++;
    }

    return Math.max(this.freezeColumnCount, index - 1);
  }

  /**
   * Get column stop index for virtualization
   */
  getColumnStopIndex(startIndex: number, scrollLeft: number): number {
    const adjustedScrollLeft = Math.max(0, scrollLeft - this.columnInitSize);
    const visibleWidth = this.containerWidth;
    let index = startIndex;
    let currentOffset = this.getColumnOffset(startIndex);

    while (index < this.columnCount && currentOffset < adjustedScrollLeft + visibleWidth) {
      currentOffset += this.getColumnWidth(index);
      index++;
    }

    return Math.min(this.columnCount - 1, index);
  }

  /**
   * Get total content width
   */
  getTotalWidth(): number {
    let totalWidth = this.columnInitSize;
    for (let i = 0; i < this.columnCount; i++) {
      totalWidth += this.getColumnWidth(i);
    }
    return totalWidth;
  }

  /**
   * Get total content height
   */
  getTotalHeight(): number {
    let totalHeight = this.rowInitSize;
    for (let i = 0; i < this.rowCount; i++) {
      totalHeight += this.getRowHeight(i);
    }
    return totalHeight;
  }

  /**
   * Clear metadata cache
   */
  clearCache(): void {
    this.rowMetaDataMap = {};
    this.columnMetaDataMap = {};
    this.lastRowIndex = -1;
    this.lastColumnIndex = -1;
  }

  /**
   * Update row height map
   */
  updateRowHeight(index: number, height: number): void {
    this.rowHeightMap[index] = height;
    this.clearCache(); // Clear cache when heights change
  }

  /**
   * Update column width map
   */
  updateColumnWidth(index: number, width: number): void {
    this.columnWidthMap[index] = width;
    this.clearCache(); // Clear cache when widths change
  }

  /**
   * Get cell position from pixel coordinates
   */
  getCellFromCoordinates(x: number, y: number): CellPosition | null {
    // Calculate row index
    const adjustedY = Math.max(0, y - this.rowInitSize);
    let rowIndex = 0;
    let currentOffset = 0;

    while (rowIndex < this.rowCount && currentOffset < adjustedY) {
      currentOffset += this.getRowHeight(rowIndex);
      if (currentOffset > adjustedY) break;
      rowIndex++;
    }

    // Calculate column index
    let columnIndex = 0;
    let currentX = this.columnInitSize;

    for (let i = 0; i < this.columnCount; i++) {
      const width = this.getColumnWidth(i);
      if (x >= currentX && x < currentX + width) {
        columnIndex = i;
        break;
      }
      currentX += width;
    }

    return [columnIndex, rowIndex];
  }

  /**
   * Get pixel coordinates from cell position
   */
  getCoordinatesFromCell(position: CellPosition): Position {
    const [col, row] = position;
    const x = this.getColumnOffset(col);
    const y = this.getRowOffset(row);
    return { x, y };
  }

  /**
   * Get rectangle bounds for a cell
   */
  getCellBounds(position: CellPosition): Rectangle {
    const [col, row] = position;
    const x = this.getColumnOffset(col);
    const y = this.getRowOffset(row);
    const width = this.getColumnWidth(col);
    const height = this.getRowHeight(row);

    return { x, y, width, height };
  }
}
