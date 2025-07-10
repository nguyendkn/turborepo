import { useCallback, useRef, useEffect } from 'react';

/**
 * Hook for infinite scroll functionality
 */
export function useInfiniteScroll(
  fetchNextPage?: () => void,
  hasNextPage?: boolean,
  isFetchingNextPage?: boolean,
  threshold: number = 100
) {
  const containerRef = useRef<HTMLDivElement>(null);

  const checkForMoreData = useCallback(
    (containerElement?: HTMLDivElement | null) => {
      if (!containerElement || !fetchNextPage || !hasNextPage || isFetchingNextPage) {
        return;
      }

      const { scrollHeight, scrollTop, clientHeight } = containerElement;
      const isReachedThreshold = scrollHeight - scrollTop - clientHeight < threshold;

      if (isReachedThreshold) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage, threshold]
  );

  // Check for initial load
  useEffect(() => {
    checkForMoreData(containerRef.current);
  }, [checkForMoreData]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    checkForMoreData(event.target as HTMLDivElement);
  }, [checkForMoreData]);

  return {
    containerRef,
    handleScroll,
    checkForMoreData,
  };
}
