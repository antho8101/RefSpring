import { useState, useCallback, useRef, useEffect } from 'react';

interface StateManagerOptions<T> {
  initialState: T;
  persist?: boolean;
  persistKey?: string;
  debounceMs?: number;
}

/**
 * Hook optimisé pour la gestion d'état avec persistance et debouncing
 */
export function useOptimizedState<T>({
  initialState,
  persist = false,
  persistKey,
  debounceMs = 0
}: StateManagerOptions<T>) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const [state, setState] = useState<T>(() => {
    if (persist && persistKey) {
      try {
        const saved = localStorage.getItem(persistKey);
        return saved ? JSON.parse(saved) : initialState;
      } catch {
        return initialState;
      }
    }
    return initialState;
  });

  const updateState = useCallback((
    newState: T | ((prevState: T) => T)
  ) => {
    setState(prevState => {
      const nextState = typeof newState === 'function' 
        ? (newState as (prevState: T) => T)(prevState)
        : newState;

      // Persist to localStorage if enabled
      if (persist && persistKey) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        if (debounceMs > 0) {
          timeoutRef.current = setTimeout(() => {
            try {
              localStorage.setItem(persistKey, JSON.stringify(nextState));
            } catch (error) {
              console.warn('Failed to persist state:', error);
            }
          }, debounceMs);
        } else {
          try {
            localStorage.setItem(persistKey, JSON.stringify(nextState));
          } catch (error) {
            console.warn('Failed to persist state:', error);
          }
        }
      }

      return nextState;
    });
  }, [persist, persistKey, debounceMs]);

  const resetState = useCallback(() => {
    setState(initialState);
    if (persist && persistKey) {
      try {
        localStorage.removeItem(persistKey);
      } catch (error) {
        console.warn('Failed to clear persisted state:', error);
      }
    }
  }, [initialState, persist, persistKey]);

  const updateField = useCallback((
    field: keyof T,
    value: T[keyof T]
  ) => {
    updateState(prev => ({ ...prev, [field]: value }));
  }, [updateState]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    state,
    updateState,
    resetState,
    updateField
  };
}

/**
 * Hook pour gérer les états de loading/error de manière cohérente
 */
export function useAsyncState<T = unknown>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async (
    asyncFunction: () => Promise<T>
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await asyncFunction();
      setData(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    loading,
    error,
    data,
    execute,
    reset
  };
}