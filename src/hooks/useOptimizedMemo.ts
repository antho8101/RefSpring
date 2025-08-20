import { useRef, DependencyList } from 'react';

// Utility to deep compare dependencies
const areEqual = (a: DependencyList, b: DependencyList): boolean => {
  if (a.length !== b.length) return false;
  
  for (let i = 0; i < a.length; i++) {
    if (Object.is(a[i], b[i])) continue;
    
    // Deep comparison for objects/arrays
    if (typeof a[i] === 'object' && typeof b[i] === 'object' && a[i] !== null && b[i] !== null) {
      if (JSON.stringify(a[i]) !== JSON.stringify(b[i])) return false;
    } else {
      return false;
    }
  }
  
  return true;
};

export const useOptimizedMemo = <T>(
  factory: () => T,
  deps: DependencyList,
  compare?: (prev: T, next: T) => boolean
): T => {
  const memoRef = useRef<{ deps: DependencyList; value: T }>();
  
  if (!memoRef.current || !areEqual(memoRef.current.deps, deps)) {
    const newValue = factory();
    
    if (!compare || !memoRef.current || !compare(memoRef.current.value, newValue)) {
      memoRef.current = { deps: [...deps], value: newValue };
    }
  }
  
  return memoRef.current.value;
};

// Hook for expensive calculations
export const useExpensiveCalculation = <T>(
  calculation: () => T,
  dependencies: DependencyList,
  threshold: number = 100 // ms
): T => {
  return useOptimizedMemo(() => {
    const start = performance.now();
    const result = calculation();
    const duration = performance.now() - start;
    
    if (duration > threshold) {
      console.warn(`Expensive calculation detected: ${duration}ms`);
    }
    
    return result;
  }, dependencies);
};

// Hook for async memoization
export const useAsyncMemo = <T>(
  asyncFactory: () => Promise<T>,
  deps: DependencyList,
  initialValue: T
): { value: T; loading: boolean; error: Error | null } => {
  const resultRef = useRef<{
    value: T;
    loading: boolean;
    error: Error | null;
    promise: Promise<T> | null;
  }>({
    value: initialValue,
    loading: false,
    error: null,
    promise: null
  });

  const memoizedPromise = useOptimizedMemo(() => {
    resultRef.current.loading = true;
    resultRef.current.error = null;
    
    const promise = asyncFactory()
      .then(value => {
        if (resultRef.current.promise === promise) {
          resultRef.current.value = value;
          resultRef.current.loading = false;
        }
        return value;
      })
      .catch(error => {
        if (resultRef.current.promise === promise) {
          resultRef.current.error = error;
          resultRef.current.loading = false;
        }
        throw error;
      });
    
    resultRef.current.promise = promise;
    return promise;
  }, deps);

  return {
    value: resultRef.current.value,
    loading: resultRef.current.loading,
    error: resultRef.current.error
  };
};