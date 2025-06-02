
import { useCallback, useRef } from 'react';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  DocumentData, 
  QueryConstraint,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface UseOptimizedFirestoreOptions {
  cacheTime?: number;
  debounceMs?: number;
  maxRetries?: number;
}

const defaultOptions: UseOptimizedFirestoreOptions = {
  cacheTime: 5 * 60 * 1000, // 5 minutes
  debounceMs: 300,
  maxRetries: 3,
};

// Cache en mémoire pour les requêtes
const queryCache = new Map<string, { data: any; timestamp: number }>();

export const useOptimizedFirestore = (options: UseOptimizedFirestoreOptions = {}) => {
  const { cacheTime, debounceMs, maxRetries } = { ...defaultOptions, ...options };
  const debounceTimers = useRef(new Map<string, NodeJS.Timeout>());

  const createCacheKey = useCallback((collectionName: string, constraints: QueryConstraint[]) => {
    return `${collectionName}_${constraints.map(c => c.toString()).join('_')}`;
  }, []);

  const isCacheValid = useCallback((timestamp: number) => {
    return Date.now() - timestamp < cacheTime!;
  }, [cacheTime]);

  const executeQuery = useCallback(async (
    collectionName: string, 
    constraints: QueryConstraint[] = [],
    useCache: boolean = true
  ): Promise<DocumentData[]> => {
    const cacheKey = createCacheKey(collectionName, constraints);
    
    // Vérifier le cache
    if (useCache && queryCache.has(cacheKey)) {
      const cached = queryCache.get(cacheKey)!;
      if (isCacheValid(cached.timestamp)) {
        console.log('📦 Cache hit pour:', cacheKey);
        return cached.data;
      }
    }

    // Exécuter la requête avec retry
    let retries = 0;
    while (retries <= maxRetries!) {
      try {
        console.log('🔍 Requête Firestore:', cacheKey, 'tentative:', retries + 1);
        
        const q = constraints.length > 0 
          ? query(collection(db, collectionName), ...constraints)
          : collection(db, collectionName);
        
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Mettre en cache
        if (useCache) {
          queryCache.set(cacheKey, { data, timestamp: Date.now() });
          console.log('💾 Données mises en cache:', cacheKey);
        }
        
        return data;
      } catch (error) {
        retries++;
        console.warn(`⚠️ Erreur requête Firestore (tentative ${retries}):`, error);
        
        if (retries > maxRetries!) {
          throw error;
        }
        
        // Attendre avant de réessayer (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
      }
    }
    
    return [];
  }, [createCacheKey, isCacheValid, maxRetries]);

  const debouncedQuery = useCallback((
    collectionName: string,
    constraints: QueryConstraint[] = [],
    callback: (data: DocumentData[]) => void,
    useCache: boolean = true
  ) => {
    const cacheKey = createCacheKey(collectionName, constraints);
    
    // Annuler le timer précédent s'il existe
    if (debounceTimers.current.has(cacheKey)) {
      clearTimeout(debounceTimers.current.get(cacheKey)!);
    }
    
    // Créer un nouveau timer
    const timer = setTimeout(async () => {
      try {
        const data = await executeQuery(collectionName, constraints, useCache);
        callback(data);
      } catch (error) {
        console.error('Erreur requête debouncée:', error);
      } finally {
        debounceTimers.current.delete(cacheKey);
      }
    }, debounceMs);
    
    debounceTimers.current.set(cacheKey, timer);
  }, [createCacheKey, debounceMs, executeQuery]);

  const clearCache = useCallback((pattern?: string) => {
    if (pattern) {
      for (const key of queryCache.keys()) {
        if (key.includes(pattern)) {
          queryCache.delete(key);
        }
      }
    } else {
      queryCache.clear();
    }
    console.log('🧹 Cache nettoyé:', pattern || 'tout');
  }, []);

  return {
    executeQuery,
    debouncedQuery,
    clearCache,
    // Helpers pour les requêtes communes
    queryWithPagination: useCallback((
      collectionName: string,
      pageSize: number,
      orderByField: string = 'createdAt',
      ...constraints: QueryConstraint[]
    ) => {
      return executeQuery(collectionName, [
        ...constraints,
        orderBy(orderByField, 'desc'),
        limit(pageSize)
      ]);
    }, [executeQuery]),
  };
};
