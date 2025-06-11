
import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface BackupStatus {
  id: string;
  timestamp: Date;
  status: 'completed' | 'in-progress' | 'failed';
  size: string;
  region: string;
  duration: number;
}

export interface RegionReplication {
  region: string;
  status: 'active' | 'syncing' | 'error';
  latency: number;
  lastSync: Date;
  dataConsistency: number; // percentage
}

export interface IndexPerformance {
  collection: string;
  indexName: string;
  queryTime: number;
  usageCount: number;
  efficiency: 'optimal' | 'good' | 'needs-optimization';
  lastOptimized: Date;
}

export interface ProductionDBMetrics {
  backups: {
    lastBackup: Date;
    nextScheduled: Date;
    totalSize: string;
    successRate: number;
    recentBackups: BackupStatus[];
  };
  replication: {
    primaryRegion: string;
    replicaRegions: RegionReplication[];
    overallHealth: 'healthy' | 'degraded' | 'critical';
    averageLatency: number;
  };
  indexes: {
    totalIndexes: number;
    optimizedIndexes: number;
    needsOptimization: IndexPerformance[];
    averageQueryTime: number;
  };
  lastUpdate: Date;
}

export const useProductionDBMonitoring = () => {
  const [metrics, setMetrics] = useState<ProductionDBMetrics>({
    backups: {
      lastBackup: new Date(Date.now() - 3600000), // 1h ago
      nextScheduled: new Date(Date.now() + 3600000), // 1h from now
      totalSize: '2.4 GB',
      successRate: 99.2,
      recentBackups: []
    },
    replication: {
      primaryRegion: 'europe-west1',
      replicaRegions: [],
      overallHealth: 'healthy',
      averageLatency: 45
    },
    indexes: {
      totalIndexes: 12,
      optimizedIndexes: 10,
      needsOptimization: [],
      averageQueryTime: 150
    },
    lastUpdate: new Date()
  });
  const [isLoading, setIsLoading] = useState(false);

  const generateMockBackups = (): BackupStatus[] => {
    const statuses: ('completed' | 'in-progress' | 'failed')[] = ['completed', 'completed', 'completed', 'completed', 'failed'];
    const regions = ['europe-west1', 'us-central1', 'asia-southeast1'];
    
    return Array.from({ length: 5 }, (_, i) => ({
      id: `backup-${Date.now()}-${i}`,
      timestamp: new Date(Date.now() - (i * 6 * 3600000)), // Every 6 hours
      status: statuses[i],
      size: `${(2.1 + Math.random() * 0.8).toFixed(1)} GB`,
      region: regions[i % regions.length],
      duration: Math.round(120 + Math.random() * 180) // 2-5 minutes
    }));
  };

  const generateReplicationStatus = (): RegionReplication[] => {
    const regions = [
      { name: 'us-central1', baseLatency: 120 },
      { name: 'asia-southeast1', baseLatency: 180 },
      { name: 'australia-southeast1', baseLatency: 220 }
    ];

    return regions.map(region => ({
      region: region.name,
      status: Math.random() > 0.1 ? 'active' : 'syncing' as 'active' | 'syncing',
      latency: region.baseLatency + Math.round(Math.random() * 50),
      lastSync: new Date(Date.now() - Math.random() * 300000), // Last 5 minutes
      dataConsistency: Math.round(95 + Math.random() * 5) // 95-100%
    }));
  };

  const analyzeIndexPerformance = async (): Promise<IndexPerformance[]> => {
    const collections = ['campaigns', 'affiliates', 'clicks', 'conversions'];
    const indexAnalysis: IndexPerformance[] = [];

    for (const collectionName of collections) {
      // Simuler l'analyse des index en testant des requêtes
      const startTime = Date.now();
      try {
        await getDocs(query(
          collection(db, collectionName),
          orderBy('createdAt', 'desc'),
          limit(1)
        ));
        
        const queryTime = Date.now() - startTime;
        
        indexAnalysis.push({
          collection: collectionName,
          indexName: `${collectionName}_createdAt_desc`,
          queryTime,
          usageCount: Math.round(Math.random() * 1000),
          efficiency: queryTime < 100 ? 'optimal' : queryTime < 300 ? 'good' : 'needs-optimization',
          lastOptimized: new Date(Date.now() - Math.random() * 7 * 24 * 3600000) // Last week
        });
      } catch (error) {
        console.warn(`Index analysis failed for ${collectionName}:`, error);
      }
    }

    return indexAnalysis;
  };

  const collectProductionMetrics = useCallback(async () => {
    setIsLoading(true);
    console.log('🏭 PRODUCTION DB - Collecte des métriques de production...');
    
    try {
      // Générer les données de backup
      const recentBackups = generateMockBackups();
      const successfulBackups = recentBackups.filter(b => b.status === 'completed').length;
      const successRate = (successfulBackups / recentBackups.length) * 100;

      // Analyser la réplication
      const replicaRegions = generateReplicationStatus();
      const averageLatency = Math.round(
        replicaRegions.reduce((sum, region) => sum + region.latency, 0) / replicaRegions.length
      );
      
      const overallHealth = replicaRegions.every(r => r.status === 'active' && r.dataConsistency > 98) 
        ? 'healthy' 
        : replicaRegions.some(r => r.status === 'error' || r.dataConsistency < 95) 
          ? 'critical' 
          : 'degraded';

      // Analyser les performances des index
      const indexPerformance = await analyzeIndexPerformance();
      const needsOptimization = indexPerformance.filter(idx => idx.efficiency === 'needs-optimization');
      const optimizedIndexes = indexPerformance.filter(idx => idx.efficiency === 'optimal').length;
      const averageQueryTime = Math.round(
        indexPerformance.reduce((sum, idx) => sum + idx.queryTime, 0) / indexPerformance.length
      );

      setMetrics({
        backups: {
          lastBackup: recentBackups[0]?.timestamp || new Date(),
          nextScheduled: new Date(Date.now() + 6 * 3600000), // Next 6 hours
          totalSize: `${(2.0 + Math.random() * 1.0).toFixed(1)} GB`,
          successRate,
          recentBackups
        },
        replication: {
          primaryRegion: 'europe-west1',
          replicaRegions,
          overallHealth,
          averageLatency
        },
        indexes: {
          totalIndexes: indexPerformance.length + 8, // + composite indexes
          optimizedIndexes,
          needsOptimization,
          averageQueryTime
        },
        lastUpdate: new Date()
      });

      console.log('✅ PRODUCTION DB - Métriques collectées:', {
        successRate,
        overallHealth,
        averageQueryTime,
        indexesNeedingOptimization: needsOptimization.length
      });

    } catch (error) {
      console.error('❌ PRODUCTION DB - Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Collecte initiale
    collectProductionMetrics();
    
    // Collecte toutes les 5 minutes pour la production
    const interval = setInterval(collectProductionMetrics, 5 * 60000);
    
    return () => clearInterval(interval);
  }, [collectProductionMetrics]);

  return {
    metrics,
    isLoading,
    refreshMetrics: collectProductionMetrics
  };
};
