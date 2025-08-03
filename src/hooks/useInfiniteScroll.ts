import { useState, useEffect, useCallback, useRef } from 'react';

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number;
}

export const useInfiniteScroll = (
  loadMore: () => void,
  options: UseInfiniteScrollOptions
) => {
  const { hasMore, isLoading, threshold = 200 } = options;
  const [isFetching, setIsFetching] = useState(false);
  const [lastTriggerTime, setLastTriggerTime] = useState(0);
  
  // Use refs to store current values and break dependency chains
  const loadMoreRef = useRef(loadMore);
  const hasMoreRef = useRef(hasMore);
  const isLoadingRef = useRef(isLoading);
  const isFetchingRef = useRef(isFetching);
  const thresholdRef = useRef(threshold);
  const lastTriggerTimeRef = useRef(lastTriggerTime);
  
  // Update all refs when values change
  useEffect(() => {
    loadMoreRef.current = loadMore;
    hasMoreRef.current = hasMore;
    isLoadingRef.current = isLoading;
    isFetchingRef.current = isFetching;
    thresholdRef.current = threshold;
    lastTriggerTimeRef.current = lastTriggerTime;
  });

  const handleScroll = useCallback(() => {
    console.log('🔍 Scroll handler called - but DISABLED for debugging');
    return; // Completely disable infinite scroll for testing
    
    // Prevent rapid successive calls using ref
    const now = Date.now();
    if (now - lastTriggerTimeRef.current < 1000) {
      console.log('🛑 Debounced - too soon since last trigger');
      return;
    }
    
    // Get scroll position - try multiple methods for better compatibility
    const scrollTop = Math.max(
      window.pageYOffset,
      document.documentElement.scrollTop,
      document.body.scrollTop
    );
    const scrollHeight = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight
    );
    const clientHeight = window.innerHeight || document.documentElement.clientHeight;
    
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    
    console.log('📏 Scroll check:', {
      distanceFromBottom,
      threshold: thresholdRef.current,
      hasMore: hasMoreRef.current,
      isLoading: isLoadingRef.current,
      isFetching: isFetchingRef.current,
      willTrigger: distanceFromBottom <= thresholdRef.current && hasMoreRef.current && !isLoadingRef.current && !isFetchingRef.current
    });
    
    // Trigger when we're within threshold pixels of the bottom
    if (distanceFromBottom <= thresholdRef.current) {
      if (hasMoreRef.current && !isLoadingRef.current && !isFetchingRef.current) {
        console.log('🚀 TRIGGERING infinite scroll');
        setLastTriggerTime(now);
        setIsFetching(true);
      } else {
        console.log('❌ Not triggering - conditions not met');
      }
    }
  }, []); // No dependencies - all values accessed via refs

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    // Use passive listeners and throttle for better performance
    const handleScrollEvent = () => {
      // Clear existing timeout
      if (timeoutId) clearTimeout(timeoutId);
      
      // Throttle the scroll handling
      timeoutId = setTimeout(() => {
        requestAnimationFrame(handleScroll);
      }, 200); // Increased to 200ms for less frequent checks
    };

    // Listen to scroll events
    window.addEventListener('scroll', handleScrollEvent, { passive: true });
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScrollEvent);
    };
  }, [handleScroll]);

  useEffect(() => {
    if (!isFetching) return;
    
    const fetchMoreData = async () => {
      console.log('📥 Starting fetch more data...');
      try {
        await loadMoreRef.current();
        console.log('✅ Fetch completed successfully');
      } catch (error) {
        console.error('❌ Error in infinite scroll:', error);
      } finally {
        console.log('🏁 Setting isFetching to false');
        setIsFetching(false);
      }
    };

    fetchMoreData();
  }, [isFetching]); // Removed loadMore dependency

  return { isFetching };
};
