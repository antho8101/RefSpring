import { useState, useEffect, useCallback, useRef } from 'react';

export const useDebouncedSearch = (
  searchTerm: string, 
  delay: number = 300
): string => {
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Clear the previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new timeout
    timeoutRef.current = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, delay);

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchTerm, delay]);

  return debouncedTerm;
};

// Advanced debounced search with immediate results for empty queries
export const useAdvancedDebouncedSearch = (
  searchTerm: string,
  delay: number = 300,
  minLength: number = 2
) => {
  const [debouncedTerm, setDebouncedTerm] = useState(searchTerm);
  const [isSearching, setIsSearching] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Clear the previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // If search term is empty or too short, return immediately
    if (searchTerm.length === 0) {
      setDebouncedTerm('');
      setIsSearching(false);
      return;
    }

    if (searchTerm.length < minLength) {
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    // Set a new timeout
    timeoutRef.current = setTimeout(() => {
      setDebouncedTerm(searchTerm);
      setIsSearching(false);
    }, delay);

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchTerm, delay, minLength]);

  const clearSearch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setDebouncedTerm('');
    setIsSearching(false);
  }, []);

  return {
    debouncedTerm,
    isSearching,
    clearSearch,
    shouldSearch: searchTerm.length >= minLength
  };
};

// Debounced function for any callback
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};

// Throttled hook for performance-critical operations
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  const lastCallRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastCallRef.current >= delay) {
      lastCallRef.current = now;
      callback(...args);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        lastCallRef.current = Date.now();
        callback(...args);
      }, delay - (now - lastCallRef.current));
    }
  }, [callback, delay]);
};