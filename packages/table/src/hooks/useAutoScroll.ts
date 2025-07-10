import { useCallback, useEffect, useRef, useState } from 'react';
import type { Position } from '../types/interaction';

/**
 * Auto-scroll direction
 */
export type ScrollDirection = -1 | 0 | 1;

/**
 * Auto-scroll configuration
 */
export interface AutoScrollConfig {
  /** Container element */
  container: HTMLElement | null;
  /** Scroll threshold in pixels */
  threshold?: number;
  /** Maximum scroll speed in pixels per frame */
  maxSpeed?: number;
  /** Speed acceleration factor */
  acceleration?: number;
  /** Enable horizontal scrolling */
  enableX?: boolean;
  /** Enable vertical scrolling */
  enableY?: boolean;
}

/**
 * Hook for auto-scrolling during drag operations
 */
export function useAutoScroll(config: AutoScrollConfig) {
  const {
    container,
    threshold = 50,
    maxSpeed = 10,
    acceleration = 0.1,
    enableX = true,
    enableY = true,
  } = config;

  const [scrollDirection, setScrollDirection] = useState<[ScrollDirection, ScrollDirection]>([0, 0]);
  const speedRef = useRef(0);
  const animationFrameRef = useRef<number>();

  // Calculate scroll direction based on mouse position
  const calculateScrollDirection = useCallback((position: Position): [ScrollDirection, ScrollDirection] => {
    if (!container) return [0, 0];

    const rect = container.getBoundingClientRect();
    const { x, y } = position;

    let xDir: ScrollDirection = 0;
    let yDir: ScrollDirection = 0;

    if (enableX) {
      if (x < rect.left + threshold) {
        xDir = -1; // Scroll left
      } else if (x > rect.right - threshold) {
        xDir = 1; // Scroll right
      }
    }

    if (enableY) {
      if (y < rect.top + threshold) {
        yDir = -1; // Scroll up
      } else if (y > rect.bottom - threshold) {
        yDir = 1; // Scroll down
      }
    }

    return [xDir, yDir];
  }, [container, threshold, enableX, enableY]);

  // Start auto-scroll
  const startAutoScroll = useCallback((position: Position) => {
    const direction = calculateScrollDirection(position);
    setScrollDirection(direction);
  }, [calculateScrollDirection]);

  // Update auto-scroll direction
  const updateAutoScroll = useCallback((position: Position) => {
    const direction = calculateScrollDirection(position);
    setScrollDirection(direction);
  }, [calculateScrollDirection]);

  // Stop auto-scroll
  const stopAutoScroll = useCallback(() => {
    setScrollDirection([0, 0]);
    speedRef.current = 0;
  }, []);

  // Auto-scroll animation loop
  useEffect(() => {
    const [xDir, yDir] = scrollDirection;

    if (xDir === 0 && yDir === 0) {
      // Stop scrolling
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
      speedRef.current = 0;
      return;
    }

    if (!container) return;

    const scroll = () => {
      // Accelerate speed
      speedRef.current = Math.min(speedRef.current + acceleration, maxSpeed);

      // Calculate scroll amounts
      const scrollX = xDir * speedRef.current;
      const scrollY = yDir * speedRef.current;

      // Perform scroll
      if (scrollX !== 0) {
        container.scrollLeft += scrollX;
      }
      if (scrollY !== 0) {
        container.scrollTop += scrollY;
      }

      // Continue animation
      animationFrameRef.current = requestAnimationFrame(scroll);
    };

    // Start animation
    animationFrameRef.current = requestAnimationFrame(scroll);

    // Cleanup on unmount or direction change
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
    };
  }, [scrollDirection, container, maxSpeed, acceleration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    startAutoScroll,
    updateAutoScroll,
    stopAutoScroll,
    isScrolling: scrollDirection[0] !== 0 || scrollDirection[1] !== 0,
    scrollDirection,
  };
}
