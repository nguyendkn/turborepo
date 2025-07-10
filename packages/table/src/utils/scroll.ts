import type { ScrollState, ScrollDirection } from '../types/interaction';

/**
 * Get wheel delta from wheel event
 */
export const getWheelDelta = ({
  event,
  pageHeight,
  lineHeight,
}: {
  event: WheelEvent;
  pageHeight?: number;
  lineHeight?: number;
}) => {
  let [x, y] = [event.deltaX, event.deltaY];
  
  // Handle horizontal scrolling with shift key
  if (x === 0 && event.shiftKey) {
    [y, x] = [0, y];
  }

  // Convert delta based on delta mode
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
    y *= lineHeight ?? 32;
  } else if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    y *= pageHeight ?? document.body.clientHeight - 180;
  }
  
  return [x, y];
};

/**
 * Calculate scroll direction
 */
export const getScrollDirection = (
  currentScroll: number,
  previousScroll: number
): ScrollDirection => {
  if (currentScroll > previousScroll) return 1;
  if (currentScroll < previousScroll) return -1;
  return 0;
};

/**
 * Check if element is scrollable
 */
export const isScrollable = (element: HTMLElement): {
  horizontal: boolean;
  vertical: boolean;
} => {
  const style = window.getComputedStyle(element);
  const overflowX = style.overflowX;
  const overflowY = style.overflowY;
  
  return {
    horizontal: overflowX === 'scroll' || overflowX === 'auto',
    vertical: overflowY === 'scroll' || overflowY === 'auto',
  };
};

/**
 * Get scroll position as percentage
 */
export const getScrollPercentage = (element: HTMLElement): {
  horizontal: number;
  vertical: number;
} => {
  const maxScrollLeft = element.scrollWidth - element.clientWidth;
  const maxScrollTop = element.scrollHeight - element.clientHeight;
  
  return {
    horizontal: maxScrollLeft > 0 ? element.scrollLeft / maxScrollLeft : 0,
    vertical: maxScrollTop > 0 ? element.scrollTop / maxScrollTop : 0,
  };
};

/**
 * Smooth scroll to position
 */
export const smoothScrollTo = (
  element: HTMLElement,
  targetX: number,
  targetY: number,
  duration: number = 300
): Promise<void> => {
  return new Promise((resolve) => {
    const startX = element.scrollLeft;
    const startY = element.scrollTop;
    const deltaX = targetX - startX;
    const deltaY = targetY - startY;
    const startTime = performance.now();

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      element.scrollLeft = startX + deltaX * easeOut;
      element.scrollTop = startY + deltaY * easeOut;
      
      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      } else {
        resolve();
      }
    };

    requestAnimationFrame(animateScroll);
  });
};

/**
 * Scroll element into view within container
 */
export const scrollIntoView = (
  container: HTMLElement,
  target: HTMLElement,
  options: {
    block?: 'start' | 'center' | 'end' | 'nearest';
    inline?: 'start' | 'center' | 'end' | 'nearest';
    smooth?: boolean;
  } = {}
) => {
  const { block = 'nearest', inline = 'nearest', smooth = true } = options;
  
  const containerRect = container.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  
  let scrollLeft = container.scrollLeft;
  let scrollTop = container.scrollTop;
  
  // Calculate horizontal scroll
  if (inline === 'start') {
    scrollLeft = target.offsetLeft;
  } else if (inline === 'center') {
    scrollLeft = target.offsetLeft - (container.clientWidth - target.offsetWidth) / 2;
  } else if (inline === 'end') {
    scrollLeft = target.offsetLeft - container.clientWidth + target.offsetWidth;
  } else if (inline === 'nearest') {
    if (targetRect.left < containerRect.left) {
      scrollLeft = target.offsetLeft;
    } else if (targetRect.right > containerRect.right) {
      scrollLeft = target.offsetLeft - container.clientWidth + target.offsetWidth;
    }
  }
  
  // Calculate vertical scroll
  if (block === 'start') {
    scrollTop = target.offsetTop;
  } else if (block === 'center') {
    scrollTop = target.offsetTop - (container.clientHeight - target.offsetHeight) / 2;
  } else if (block === 'end') {
    scrollTop = target.offsetTop - container.clientHeight + target.offsetHeight;
  } else if (block === 'nearest') {
    if (targetRect.top < containerRect.top) {
      scrollTop = target.offsetTop;
    } else if (targetRect.bottom > containerRect.bottom) {
      scrollTop = target.offsetTop - container.clientHeight + target.offsetHeight;
    }
  }
  
  // Clamp scroll values
  scrollLeft = Math.max(0, Math.min(scrollLeft, container.scrollWidth - container.clientWidth));
  scrollTop = Math.max(0, Math.min(scrollTop, container.scrollHeight - container.clientHeight));
  
  if (smooth) {
    return smoothScrollTo(container, scrollLeft, scrollTop);
  } else {
    container.scrollLeft = scrollLeft;
    container.scrollTop = scrollTop;
    return Promise.resolve();
  }
};

/**
 * Create scroll state object
 */
export const createScrollState = (
  scrollLeft: number,
  scrollTop: number,
  isScrolling: boolean = false
): ScrollState => ({
  scrollLeft,
  scrollTop,
  isScrolling,
});

/**
 * Check if scroll state has changed
 */
export const hasScrollStateChanged = (
  current: ScrollState,
  previous: ScrollState
): boolean => {
  return (
    current.scrollLeft !== previous.scrollLeft ||
    current.scrollTop !== previous.scrollTop ||
    current.isScrolling !== previous.isScrolling
  );
};
