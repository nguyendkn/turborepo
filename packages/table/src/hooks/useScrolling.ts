import { useState, useCallback, useRef } from 'react';
import type { ScrollState } from '../types/interaction';
import { createScrollState, hasScrollStateChanged } from '../utils/scroll';

/**
 * Hook for managing scroll state and behavior
 */
export function useScrolling(onScrollChange?: (scrollState: ScrollState) => void) {
  const [scrollState, setScrollState] = useState<ScrollState>(createScrollState(0, 0));
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  const updateScrollState = useCallback((scrollLeft: number, scrollTop: number) => {
    const newState = createScrollState(scrollLeft, scrollTop, true);
    
    if (hasScrollStateChanged(newState, scrollState)) {
      setScrollState(newState);
      onScrollChange?.(newState);

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Set scroll end timeout
      scrollTimeoutRef.current = setTimeout(() => {
        const endState = createScrollState(scrollLeft, scrollTop, false);
        setScrollState(endState);
        onScrollChange?.(endState);
      }, 150);
    }
  }, [scrollState, onScrollChange]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLElement>) => {
    const target = event.currentTarget;
    updateScrollState(target.scrollLeft, target.scrollTop);
  }, [updateScrollState]);

  return {
    scrollState,
    handleScroll,
    updateScrollState,
    isScrolling: scrollState.isScrolling,
  };
}
