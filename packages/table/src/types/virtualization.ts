/**
 * Virtualization configuration interface
 */
export interface VirtualizationConfig {
  /** Estimated item size */
  estimateSize: number;
  /** Number of items to render outside visible area */
  overscan: number;
  /** Whether to enable horizontal virtualization */
  horizontal: boolean;
  /** Whether to enable vertical virtualization */
  vertical: boolean;
  /** Container width for horizontal virtualization */
  width?: number;
  /** Container height for vertical virtualization */
  height?: number;
}

/**
 * Virtual item interface
 */
export interface VirtualItem {
  /** Item index */
  index: number;
  /** Item start position */
  start: number;
  /** Item size */
  size: number;
  /** Item end position */
  end: number;
  /** Item key */
  key: string;
}

/**
 * Virtual range interface
 */
export interface VirtualRange {
  /** Start index */
  startIndex: number;
  /** End index */
  endIndex: number;
  /** Visible items */
  items: VirtualItem[];
}

/**
 * Virtualizer interface
 */
export interface Virtualizer {
  /** Get virtual items */
  getVirtualItems: () => VirtualItem[];
  /** Get total size */
  getTotalSize: () => number;
  /** Scroll to index */
  scrollToIndex: (index: number, options?: { align?: 'start' | 'center' | 'end' | 'auto' }) => void;
  /** Scroll to offset */
  scrollToOffset: (offset: number) => void;
  /** Measure element */
  measureElement: (element: HTMLElement) => void;
}

/**
 * Virtualization event handlers
 */
export interface VirtualizationEventHandlers {
  /** Scroll handler */
  onScroll?: (offset: number) => void;
  /** Range change handler */
  onRangeChange?: (range: VirtualRange) => void;
  /** Item render handler */
  onItemRender?: (item: VirtualItem) => void;
}
