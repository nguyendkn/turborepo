import type { VirtualItem, VirtualRange } from '../types/virtualization';

/**
 * Manager for virtualization calculations
 */
export class VirtualizationManager {
  private itemCount: number = 0;
  private estimatedSize: number = 40;
  private overscan: number = 5;
  private scrollOffset: number = 0;
  private containerSize: number = 0;

  constructor(
    itemCount: number = 0,
    estimatedSize: number = 40,
    overscan: number = 5
  ) {
    this.itemCount = itemCount;
    this.estimatedSize = estimatedSize;
    this.overscan = overscan;
  }

  /**
   * Update configuration
   */
  setConfig(config: {
    itemCount?: number;
    estimatedSize?: number;
    overscan?: number;
  }): void {
    if (config.itemCount !== undefined) this.itemCount = config.itemCount;
    if (config.estimatedSize !== undefined) this.estimatedSize = config.estimatedSize;
    if (config.overscan !== undefined) this.overscan = config.overscan;
  }

  /**
   * Update scroll state
   */
  setScrollState(scrollOffset: number, containerSize: number): void {
    this.scrollOffset = scrollOffset;
    this.containerSize = containerSize;
  }

  /**
   * Calculate visible range
   */
  getVisibleRange(): VirtualRange {
    const startIndex = Math.max(0, Math.floor(this.scrollOffset / this.estimatedSize) - this.overscan);
    const endIndex = Math.min(
      this.itemCount - 1,
      Math.ceil((this.scrollOffset + this.containerSize) / this.estimatedSize) + this.overscan
    );

    const items: VirtualItem[] = [];
    for (let i = startIndex; i <= endIndex; i++) {
      const start = i * this.estimatedSize;
      items.push({
        index: i,
        start,
        size: this.estimatedSize,
        end: start + this.estimatedSize,
        key: `item-${i}`,
      });
    }

    return {
      startIndex,
      endIndex,
      items,
    };
  }

  /**
   * Get total size
   */
  getTotalSize(): number {
    return this.itemCount * this.estimatedSize;
  }

  /**
   * Get offset for specific index
   */
  getOffsetForIndex(index: number): number {
    return Math.max(0, Math.min(index, this.itemCount - 1)) * this.estimatedSize;
  }

  /**
   * Get index at offset
   */
  getIndexAtOffset(offset: number): number {
    return Math.max(0, Math.min(Math.floor(offset / this.estimatedSize), this.itemCount - 1));
  }

  /**
   * Calculate scroll offset to center item
   */
  getScrollOffsetForIndex(index: number, align: 'start' | 'center' | 'end' = 'start'): number {
    const itemOffset = this.getOffsetForIndex(index);
    
    switch (align) {
      case 'start':
        return itemOffset;
      case 'center':
        return itemOffset - (this.containerSize - this.estimatedSize) / 2;
      case 'end':
        return itemOffset - this.containerSize + this.estimatedSize;
      default:
        return itemOffset;
    }
  }
}
