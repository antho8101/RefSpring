
import { useState, useCallback } from 'react';
import { AppError } from '@/types/errors';
import { useErrorHandler } from './useErrorHandler';

interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  exponentialBackoff?: boolean;
  retryCondition?: (error: AppError) => boolean;
}

interface RetryState {
  isRetrying: boolean;
  retryCount: number;
  lastError: AppError | null;
}

export const useRetry = (options: RetryOptions = {}) => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    exponentialBackoff = true,
    retryCondition = (error: AppError) => error.retryable
  } = options;

  const { handleError } = useErrorHandler();
  const [retryState, setRetryState] = useState<RetryState>({
    isRetrying: false,
    retryCount: 0,
    lastError: null
  });

  const calculateDelay = useCallback((attempt: number): number => {
    if (!exponentialBackoff) return baseDelay;
    
    const delay = baseDelay * Math.pow(2, attempt);
    return Math.min(delay, maxDelay);
  }, [baseDelay, maxDelay, exponentialBackoff]);

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    context: { component?: string; action?: string } = {}
  ): Promise<T> => {
    let lastError: AppError | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        setRetryState(prev => ({
          ...prev,
          isRetrying: attempt > 0,
          retryCount: attempt
        }));

        const result = await operation();
        
        // Succès - réinitialiser l'état
        setRetryState({
          isRetrying: false,
          retryCount: 0,
          lastError: null
        });

        return result;

      } catch (error) {
        const appError = handleError(error, { 
          showToast: false, 
          logError: attempt === maxRetries,
          throwError: false 
        });

        lastError = appError;

        // Vérifier si on peut retry
        if (attempt < maxRetries && retryCondition(appError)) {
          const delay = calculateDelay(attempt);
          console.log(`🔄 Retry ${attempt + 1}/${maxRetries} dans ${delay}ms pour:`, context);
          
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        // Plus de retries possibles
        break;
      }
    }

    // Toutes les tentatives ont échoué
    setRetryState({
      isRetrying: false,
      retryCount: maxRetries,
      lastError
    });

    if (lastError) {
      handleError(lastError, { showToast: true });
      throw lastError;
    }

    throw new AppError('Échec de toutes les tentatives');
  }, [maxRetries, retryCondition, calculateDelay, handleError]);

  const reset = useCallback(() => {
    setRetryState({
      isRetrying: false,
      retryCount: 0,
      lastError: null
    });
  }, []);

  return {
    executeWithRetry,
    reset,
    ...retryState
  };
};
