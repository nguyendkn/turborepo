/**
 * Auto-sizing configuration interface
 */
export interface AutoSizeConfig {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  lineHeight?: number;
}

/**
 * Canvas-based text measurement utility
 */
export class MeasuredCanvas {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private fontFamily: string;

  constructor(defaults: AutoSizeConfig = {}) {
    this.fontFamily = defaults.fontFamily || 
      'Inter, Roboto, -apple-system, BlinkMacSystemFont, avenir next, avenir, segoe ui, helvetica neue, helvetica, Ubuntu, noto, arial, sans-serif';
    
    if (typeof window !== 'undefined' && document?.fonts?.ready != null) {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
      this.setFontSize(13);
    }
  }

  setFontSize(fontSize: number) {
    if (this.ctx) {
      this.ctx.font = `${fontSize}px ${this.fontFamily}`;
    }
  }

  reset() {
    this.setFontSize(13);
  }

  measureText(text: string): number {
    if (!this.ctx) return text.length * 8; // Fallback estimation
    return this.ctx.measureText(text).width;
  }

  getTextHeight(fontSize: number = 13): number {
    if (!this.ctx) return fontSize;
    
    this.setFontSize(fontSize);
    const metrics = this.ctx.measureText('Mg');
    return metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
  }
}

/**
 * Global measured canvas instance
 */
export const measuredCanvas = new MeasuredCanvas();

/**
 * Measure text width using canvas
 */
export const measureTextWidth = (text: string, fontSize: number = 13): number => {
  measuredCanvas.setFontSize(fontSize);
  return measuredCanvas.measureText(text);
};

/**
 * Calculate optimal column width based on content
 */
export const calculateOptimalColumnWidth = (
  values: string[],
  headerText: string,
  minWidth: number = 60,
  maxWidth: number = 300,
  padding: number = 16
): number => {
  let maxWidth_calculated = minWidth;

  // Measure header text
  const headerWidth = measureTextWidth(headerText) + padding;
  maxWidth_calculated = Math.max(maxWidth_calculated, headerWidth);

  // Measure content values
  for (const value of values) {
    if (value != null) {
      const contentWidth = measureTextWidth(String(value)) + padding;
      maxWidth_calculated = Math.max(maxWidth_calculated, contentWidth);
    }
  }

  return Math.min(maxWidth_calculated, maxWidth);
};

/**
 * Get element dimensions
 */
export const getElementDimensions = (element: HTMLElement): { width: number; height: number } => {
  const rect = element.getBoundingClientRect();
  return {
    width: rect.width,
    height: rect.height
  };
};

/**
 * Get scroll dimensions
 */
export const getScrollDimensions = (element: HTMLElement): {
  scrollWidth: number;
  scrollHeight: number;
  clientWidth: number;
  clientHeight: number;
} => {
  return {
    scrollWidth: element.scrollWidth,
    scrollHeight: element.scrollHeight,
    clientWidth: element.clientWidth,
    clientHeight: element.clientHeight
  };
};

/**
 * Calculate visible area
 */
export const calculateVisibleArea = (
  containerWidth: number,
  containerHeight: number,
  scrollLeft: number,
  scrollTop: number,
  totalWidth: number,
  totalHeight: number
) => {
  return {
    left: scrollLeft,
    top: scrollTop,
    right: Math.min(scrollLeft + containerWidth, totalWidth),
    bottom: Math.min(scrollTop + containerHeight, totalHeight),
    width: Math.min(containerWidth, totalWidth - scrollLeft),
    height: Math.min(containerHeight, totalHeight - scrollTop)
  };
};

/**
 * Debounce function for performance optimization
 */
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Throttle function for performance optimization
 */
export const throttle = <T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};
