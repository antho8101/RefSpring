/**
 * Utilitaires pour éviter les erreurs logiques communes
 */

// Type guard pour vérifier si une valeur est définie et non nulle
export const isDefined = <T>(value: T | null | undefined): value is T => {
  return value !== null && value !== undefined;
};

// Safe division pour éviter les divisions par zéro
export const safeDivision = (numerator: number, denominator: number, fallback = 0): number => {
  if (denominator === 0 || !isFinite(denominator) || !isFinite(numerator)) {
    return fallback;
  }
  const result = numerator / denominator;
  return isFinite(result) ? result : fallback;
};

// Safe percentage calculation
export const safePercentage = (part: number, total: number, decimals = 1): number => {
  const percentage = safeDivision(part * 100, total, 0);
  return Number(percentage.toFixed(decimals));
};

// Safe array access pour éviter les erreurs d'index
export const safeArrayAccess = <T>(array: T[], index: number): T | undefined => {
  return array && array.length > index && index >= 0 ? array[index] : undefined;
};

// Validation des nombres pour éviter NaN et Infinity
export const safeNumber = (value: unknown, fallback = 0): number => {
  const num = typeof value === 'number' ? value : parseFloat(String(value));
  return isFinite(num) && !isNaN(num) ? num : fallback;
};

// Safe string pour éviter null/undefined
export const safeString = (value: unknown, fallback = ''): string => {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return fallback;
  return String(value);
};

// Race condition protection avec abort controller
export const createAbortableEffect = () => {
  const controller = new AbortController();
  const cleanup = () => controller.abort();
  const isAborted = () => controller.signal.aborted;
  
  return { controller, cleanup, isAborted };
};

// Safe async operation avec timeout
export const safeAsyncOperation = async <T>(
  operation: () => Promise<T>,
  timeoutMs = 10000,
  fallback?: T
): Promise<T | undefined> => {
  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Operation timeout')), timeoutMs)
    );
    
    return await Promise.race([operation(), timeoutPromise]);
  } catch (error) {
    console.warn('Safe async operation failed:', error);
    return fallback;
  }
};

// Debounced state setter pour éviter les updates rapides
export const createDebouncedSetter = <T>(
  setter: (value: T) => void,
  delay = 300
) => {
  let timeoutId: NodeJS.Timeout;
  
  return (value: T) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => setter(value), delay);
  };
};

// Validator pour les objets complexes
export const validateObject = <T extends Record<string, unknown>>(
  obj: unknown,
  requiredFields: (keyof T)[],
  validators?: Partial<Record<keyof T, (value: unknown) => boolean>>
): obj is T => {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  
  const typedObj = obj as T;
  
  // Vérifier les champs requis
  for (const field of requiredFields) {
    if (!(field in typedObj) || typedObj[field] === undefined || typedObj[field] === null) {
      return false;
    }
  }
  
  // Vérifier les validateurs personnalisés
  if (validators) {
    for (const [field, validator] of Object.entries(validators)) {
      if (field in typedObj && !validator(typedObj[field as keyof T])) {
        return false;
      }
    }
  }
  
  return true;
};

// Safe array operations
export const safeArrayOperation = {
  filter: <T>(array: T[] | null | undefined, predicate: (item: T) => boolean): T[] => {
    return array?.filter(predicate) ?? [];
  },
  
  map: <T, U>(array: T[] | null | undefined, mapper: (item: T) => U): U[] => {
    return array?.map(mapper) ?? [];
  },
  
  find: <T>(array: T[] | null | undefined, predicate: (item: T) => boolean): T | undefined => {
    return array?.find(predicate);
  },
  
  reduce: <T, U>(array: T[] | null | undefined, reducer: (acc: U, item: T) => U, initial: U): U => {
    return array?.reduce(reducer, initial) ?? initial;
  }
};

// State consistency checker
export const createStateConsistencyChecker = <T extends Record<string, unknown>>(
  initialState: T
) => {
  let previousState = { ...initialState };
  
  return {
    check: (currentState: T, rules: Array<(prev: T, curr: T) => string | null>) => {
      const violations = rules
        .map(rule => rule(previousState, currentState))
        .filter(isDefined);
        
      previousState = { ...currentState };
      
      if (violations.length > 0) {
        console.warn('State consistency violations:', violations);
      }
      
      return violations;
    }
  };
};