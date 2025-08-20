import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useServiceHealth } from '@/hooks/useServiceHealth';
import { useFirestoreMonitoring } from '@/hooks/useFirestoreMonitoring';
import { useProductionDBMonitoring } from '@/hooks/useProductionDBMonitoring';
import { collection, getDocs, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Logger from '@/utils/logger';
import { AdminHeader } from './admin/AdminHeader';
import { SystemStatusCard } from './admin/SystemStatusCard';
import { SystemMetricsGrid } from './admin/SystemMetricsGrid';
import { ServiceHealthList } from './admin/ServiceHealthList';
import { AdminActions } from './admin/AdminActions';
import { FirestoreMetricsCard } from './admin/FirestoreMetricsCard';
import { ProductionDBCard } from './admin/ProductionDBCard';

interface SystemStats {
  totalCollections: number;
  totalDocuments: number;
  averageResponseTime: number;
  healthyServices: number;
  totalServices: number;
  lastUpdateTime: Date;
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  issues: string[];
  lastCheck: Date;
}

export const AdminDashboard = () => {
  const { currentEmail, adminEmail } = useAdminAuth();
  const { healthChecks, isChecking, lastUpdate, runHealthChecks } = useServiceHealth();
  const { metrics: firestoreMetrics, isLoading: isFirestoreLoading, refreshMetrics } = useFirestoreMonitoring();
  const { metrics: productionMetrics, isLoading: isProductionLoading, refreshMetrics: refreshProductionMetrics } = useProductionDBMonitoring();
  const [systemStats, setSystemStats] = useState<SystemStats>({
    totalCollections: 0,
    totalDocuments: 0,
    averageResponseTime: 0,
    healthyServices: 0,
    totalServices: 0,
    lastUpdateTime: new Date(),
  });
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    status: 'healthy',
    issues: [],
    lastCheck: new Date(),
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSystemStats();
    calculateSystemHealth();
  }, [healthChecks]);

  const loadSystemStats = async () => {
    try {
      Logger.admin('Loading real system statistics');

      // Compter les documents dans les collections principales
      const collections = ['campaigns', 'affiliates', 'clicks', 'conversions'];
      let totalDocs = 0;
      
      for (const collectionName of collections) {
        try {
          const countQuery = await getCountFromServer(collection(db, collectionName));
          totalDocs += countQuery.data().count;
        } catch (error) {
          Logger.warning(`Could not count ${collectionName}, falling back to getDocs`);
          const snapshot = await getDocs(collection(db, collectionName));
          totalDocs += snapshot.size;
        }
      }

      // Calculer les vraies métriques basées sur les health checks
      const avgResponseTime = healthChecks.length > 0 
        ? Math.round(healthChecks.reduce((sum, check) => sum + check.responseTime, 0) / healthChecks.length)
        : 0;

      const healthyServices = healthChecks.filter(check => check.status === 'operational').length;
      
      setSystemStats({
        totalCollections: collections.length,
        totalDocuments: totalDocs,
        averageResponseTime: avgResponseTime,
        healthyServices,
        totalServices: healthChecks.length,
        lastUpdateTime: new Date(),
      });

      Logger.admin('Real system stats loaded', {
        totalDocuments: totalDocs,
        avgResponseTime,
        healthyServices,
        totalServices: healthChecks.length
      });
    } catch (error) {
      Logger.error('ADMIN - Error loading system stats', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSystemHealth = () => {
    const issues: string[] = [];
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';

    // Analyser les health checks réels
    healthChecks.forEach(check => {
      if (check.status === 'outage') {
        issues.push(`${check.name}: Service indisponible`);
        status = 'critical';
      } else if (check.status === 'degraded') {
        issues.push(`${check.name}: Performance dégradée (${check.responseTime}ms)`);
        if (status !== 'critical') status = 'warning';
      } else if (check.responseTime > 2000) {
        issues.push(`${check.name}: Temps de réponse élevé (${check.responseTime}ms)`);
        if (status === 'healthy') status = 'warning';
      }
    });

    // Vérifier la disponibilité des services
    const serviceAvailability = systemStats.totalServices > 0 
      ? (systemStats.healthyServices / systemStats.totalServices) * 100 
      : 100;

    if (serviceAvailability < 80) {
      issues.push(`Disponibilité des services faible: ${serviceAvailability.toFixed(1)}%`);
      status = 'critical';
    } else if (serviceAvailability < 95) {
      issues.push(`Disponibilité des services réduite: ${serviceAvailability.toFixed(1)}%`);
      if (status === 'healthy') status = 'warning';
    }

    setSystemHealth({
      status,
      issues,
      lastCheck: new Date(),
    });
  };

  const handleRefresh = () => {
    runHealthChecks();
    loadSystemStats();
    refreshProductionMetrics();
  };

  if (loading && healthChecks.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du monitoring système...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader currentEmail={currentEmail} adminEmail={adminEmail} />
      
      <div className="p-6">
        <SystemStatusCard 
          systemHealth={systemHealth} 
          isChecking={isChecking} 
          onRefresh={handleRefresh} 
        />
        
        <SystemMetricsGrid systemStats={systemStats} />
        
        <ProductionDBCard 
          metrics={productionMetrics}
          isLoading={isProductionLoading}
          onRefresh={refreshProductionMetrics}
        />
        
        <FirestoreMetricsCard 
          metrics={firestoreMetrics}
          isLoading={isFirestoreLoading}
          onRefresh={refreshMetrics}
        />
        
        <ServiceHealthList healthChecks={healthChecks} />
        
        <AdminActions 
          onRunHealthChecks={handleRefresh} 
          isChecking={isChecking} 
        />
      </div>
    </div>
  );
};
