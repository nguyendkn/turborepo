import { useVirtualizer } from '@tanstack/react-virtual';
import type { VirtualizationConfig } from '../types/virtualization';

/**
 * Hook for table virtualization
 */
export function useVirtualization(
  config: VirtualizationConfig & {
    count: number;
    getScrollElement: () => HTMLElement | null;
  }
) {
  const virtualizer = useVirtualizer({
    count: config.count,
    getScrollElement: config.getScrollElement,
    estimateSize: () => config.estimateSize,
    overscan: config.overscan,
    horizontal: config.horizontal,
  });

  return {
    virtualizer,
    virtualItems: virtualizer.getVirtualItems(),
    totalSize: virtualizer.getTotalSize(),
    scrollToIndex: virtualizer.scrollToIndex,
    scrollToOffset: virtualizer.scrollToOffset,
  };
}
