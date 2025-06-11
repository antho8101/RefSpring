
import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, getCountFromServer, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface FirestoreMetrics {
  totalReads: number;
  totalWrites: number;
  avgQueryTime: number;
  activeConnections: number;
  quotaUsage: {
    reads: { used: number; limit: number; percentage: number };
    writes: { used: number; limit: number; percentage: number };
    storage: { used: number; limit: number; percentage: number };
  };
  slowQueries: Array<{
    collection: string;
    queryTime: number;
    timestamp: Date;
  }>;
  lastUpdate: Date;
}

export const useFirestoreMonitoring = () => {
  const [metrics, setMetrics] = useState<FirestoreMetrics>({
    totalReads: 0,
    totalWrites: 0,
    avgQueryTime: 0,
    activeConnections: 1,
    quotaUsage: {
      reads: { used: 0, limit: 50000, percentage: 0 },
      writes: { used: 0, limit: 20000, percentage: 0 },
      storage: { used: 0, limit: 1000, percentage: 0 }
    },
    slowQueries: [],
    lastUpdate: new Date()
  });
  const [isLoading, setIsLoading] = useState(false);

  const measureQueryTime = async (queryFn: () => Promise<any>, collection: string) => {
    const startTime = Date.now();
    try {
      const result = await queryFn();
      const queryTime = Date.now() - startTime;
      
      // Si la requête prend plus de 2 secondes, la marquer comme lente
      if (queryTime > 2000) {
        setMetrics(prev => ({
          ...prev,
          slowQueries: [
            ...prev.slowQueries.slice(-4), // Garder seulement les 5 dernières
            {
              collection,
              queryTime,
              timestamp: new Date()
            }
          ]
        }));
      }
      
      return { result, queryTime };
    } catch (error) {
      const queryTime = Date.now() - startTime;
      console.warn(`⚠️ Erreur requête ${collection}:`, error);
      return { result: null, queryTime };
    }
  };

  const collectMetrics = useCallback(async () => {
    setIsLoading(true);
    console.log('📊 FIRESTORE MONITORING - Collecte des métriques...');
    
    try {
      const collections = ['campaigns', 'affiliates', 'clicks', 'conversions'];
      let totalReads = 0;
      let totalQueryTime = 0;
      let queryCount = 0;

      // Mesurer les performances de chaque collection
      for (const collectionName of collections) {
        // Test de lecture simple
        const { queryTime: readTime } = await measureQueryTime(
          () => getDocs(query(collection(db, collectionName), limit(1))),
          collectionName
        );
        
        // Test de comptage
        const { queryTime: countTime } = await measureQueryTime(
          () => getCountFromServer(collection(db, collectionName)),
          `${collectionName}-count`
        );
        
        totalReads += 2; // Une lecture + un count par collection
        totalQueryTime += readTime + countTime;
        queryCount += 2;
      }

      const avgQueryTime = queryCount > 0 ? Math.round(totalQueryTime / queryCount) : 0;

      // Estimation des quotas (simulation basée sur l'activité)
      const estimatedDailyReads = totalReads * 1440; // Estimation pour 24h
      const estimatedDailyWrites = Math.round(totalReads * 0.1); // 10% du nombre de lectures
      
      setMetrics(prev => ({
        ...prev,
        totalReads: prev.totalReads + totalReads,
        totalWrites: prev.totalWrites + Math.round(totalReads * 0.05),
        avgQueryTime,
        quotaUsage: {
          reads: {
            used: Math.min(estimatedDailyReads, 50000),
            limit: 50000,
            percentage: Math.min((estimatedDailyReads / 50000) * 100, 100)
          },
          writes: {
            used: Math.min(estimatedDailyWrites, 20000),
            limit: 20000,
            percentage: Math.min((estimatedDailyWrites / 20000) * 100, 100)
          },
          storage: {
            used: Math.round(Math.random() * 100), // Simulation
            limit: 1000,
            percentage: Math.round(Math.random() * 10)
          }
        },
        lastUpdate: new Date()
      }));

      console.log('✅ FIRESTORE MONITORING - Métriques collectées:', {
        avgQueryTime,
        totalReads,
        estimatedDailyReads
      });

    } catch (error) {
      console.error('❌ FIRESTORE MONITORING - Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Collecte initiale
    collectMetrics();
    
    // Collecte toutes les 60 secondes
    const interval = setInterval(collectMetrics, 60000);
    
    return () => clearInterval(interval);
  }, [collectMetrics]);

  return {
    metrics,
    isLoading,
    refreshMetrics: collectMetrics
  };
};
