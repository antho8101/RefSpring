import { useState, useEffect, useRef, ReactNode, useMemo } from 'react';
import { useOptimizedMemo } from '@/hooks/useOptimizedMemo';

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  itemHeight: number;
  containerHeight?: number;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  getItemId?: (item: T, index: number) => string | number;
}

export const VirtualizedList = <T extends any>({
  items,
  renderItem,
  itemHeight,
  containerHeight = 400,
  overscan = 5,
  className = '',
  onScroll,
  getItemId
}: VirtualizedListProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate visible range with overscan
  const visibleRange = useOptimizedMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  // Get visible items
  const visibleItems = useOptimizedMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  // Total height of all items
  const totalHeight = useMemo(() => items.length * itemHeight, [items.length, itemHeight]);

  // Handle scroll with throttling
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = event.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  };

  // Scroll to specific item
  const scrollToItem = (index: number, alignment: 'start' | 'center' | 'end' = 'start') => {
    if (!containerRef.current) return;

    let targetScrollTop = index * itemHeight;

    switch (alignment) {
      case 'center':
        targetScrollTop = targetScrollTop - containerHeight / 2 + itemHeight / 2;
        break;
      case 'end':
        targetScrollTop = targetScrollTop - containerHeight + itemHeight;
        break;
    }

    // Clamp to valid range
    targetScrollTop = Math.max(0, Math.min(targetScrollTop, totalHeight - containerHeight));

    containerRef.current.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth'
    });
  };

  // Ensure container maintains scroll position when items change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = scrollTop;
    }
  }, [items.length]);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
      role="listbox"
      aria-label={`Virtual list with ${items.length} items`}
    >
      <div
        style={{ 
          height: totalHeight, 
          position: 'relative'
        }}
        role="presentation"
      >
        {visibleItems.map((item, index) => {
          const actualIndex = visibleRange.startIndex + index;
          const itemKey = getItemId ? getItemId(item, actualIndex) : actualIndex;
          
          return (
            <div
              key={itemKey}
              style={{
                position: 'absolute',
                top: actualIndex * itemHeight,
                width: '100%',
                height: itemHeight
              }}
              role="option"
              aria-setsize={items.length}
              aria-posinset={actualIndex + 1}
            >
              {renderItem(item, actualIndex)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Hook for managing virtualized list state
export const useVirtualizedList = <T extends any>(items: T[], itemHeight: number) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(400);

  const scrollToItem = (index: number, alignment: 'start' | 'center' | 'end' = 'start') => {
    let targetScrollTop = index * itemHeight;

    switch (alignment) {
      case 'center':
        targetScrollTop = targetScrollTop - containerHeight / 2 + itemHeight / 2;
        break;
      case 'end':
        targetScrollTop = targetScrollTop - containerHeight + itemHeight;
        break;
    }

    setScrollTop(Math.max(0, Math.min(targetScrollTop, items.length * itemHeight - containerHeight)));
  };

  const scrollToTop = () => setScrollTop(0);
  const scrollToBottom = () => setScrollTop(items.length * itemHeight - containerHeight);

  return {
    scrollTop,
    setScrollTop,
    containerHeight,
    setContainerHeight,
    scrollToItem,
    scrollToTop,
    scrollToBottom
  };
};