
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Server, Database, Activity, TrendingUp, AlertTriangle, Zap, Clock } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useServiceHealth } from '@/hooks/useServiceHealth';
import { collection, getDocs, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
      console.log('🔒 ADMIN - Loading real system statistics');

      // Compter les documents dans les collections principales
      const collections = ['campaigns', 'affiliates', 'clicks', 'conversions'];
      let totalDocs = 0;
      
      for (const collectionName of collections) {
        try {
          const countQuery = await getCountFromServer(collection(db, collectionName));
          totalDocs += countQuery.data().count;
        } catch (error) {
          console.warn(`Could not count ${collectionName}, falling back to getDocs`);
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

      console.log('✅ ADMIN - Real system stats loaded:', {
        totalDocuments: totalDocs,
        avgResponseTime,
        healthyServices,
        totalServices: healthChecks.length
      });
    } catch (error) {
      console.error('❌ ADMIN - Error loading system stats:', error);
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

  const formatUptime = (lastUpdate: Date) => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60));
    if (diffMinutes < 60) return `${diffMinutes}m`;
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours}h ${diffMinutes % 60}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <Activity className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getServiceAvailability = () => {
    if (systemStats.totalServices === 0) return 100;
    return ((systemStats.healthyServices / systemStats.totalServices) * 100).toFixed(1);
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
      {/* Header Admin */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-red-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Monitoring Système</h1>
              <p className="text-sm text-gray-600">RefSpring - Dashboard Administrateur</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Connecté en tant qu'admin</p>
            <p className="text-sm font-medium text-gray-900">{currentEmail}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Alerte de sécurité */}
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <p className="text-sm text-red-800">
                <strong>Zone Administrateur :</strong> Monitoring système - Accès limité à {adminEmail}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Statut global du système */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(systemHealth.status)}
              Statut Global du Système
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className={`text-lg font-semibold ${getStatusColor(systemHealth.status)}`}>
                  {systemHealth.status === 'healthy' && 'Système Opérationnel'}
                  {systemHealth.status === 'warning' && 'Attention Requise'}
                  {systemHealth.status === 'critical' && 'Incident Critique'}
                </p>
                <p className="text-sm text-gray-500">
                  Dernière vérification: {systemHealth.lastCheck.toLocaleString('fr-FR')}
                </p>
              </div>
              <Button
                onClick={() => {
                  runHealthChecks();
                  loadSystemStats();
                }}
                disabled={isChecking}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Activity className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
                {isChecking ? 'Vérification...' : 'Actualiser'}
              </Button>
            </div>

            {systemHealth.issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Problèmes détectés:</h4>
                {systemHealth.issues.map((issue, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
                    <AlertTriangle className="h-4 w-4" />
                    {issue}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Métriques système réelles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Temps de Réponse</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.averageResponseTime}ms</div>
              <p className="text-xs text-muted-foreground">
                Moyenne des services actifs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Base de Données</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalDocuments}</div>
              <p className="text-xs text-muted-foreground">
                Documents totaux ({systemStats.totalCollections} collections)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Disponibilité</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getServiceAvailability()}%</div>
              <p className="text-xs text-muted-foreground">
                {systemStats.healthyServices}/{systemStats.totalServices} services
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dernière MàJ</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatUptime(systemStats.lastUpdateTime)}</div>
              <p className="text-xs text-muted-foreground">
                Il y a
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Services Health Checks */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Services et Composants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {healthChecks.map((check, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      check.status === 'operational' ? 'bg-green-500' :
                      check.status === 'degraded' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                    <div>
                      <h3 className="font-medium text-gray-900">{check.name}</h3>
                      <p className="text-sm text-gray-500">
                        {check.responseTime}ms • Vérifié: {check.lastChecked.toLocaleTimeString('fr-FR')}
                      </p>
                      {check.errorMessage && (
                        <p className="text-sm text-red-600 mt-1">{check.errorMessage}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      check.status === 'operational' ? 'bg-green-100 text-green-800' :
                      check.status === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {check.status === 'operational' ? 'Opérationnel' :
                       check.status === 'degraded' ? 'Dégradé' : 'Panne'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions administrateur */}
        <Card>
          <CardHeader>
            <CardTitle>Actions Système</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              <Button 
                variant="outline" 
                onClick={() => window.open('https://console.firebase.google.com', '_blank')}
              >
                Console Firebase
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.open('https://vercel.com/dashboard', '_blank')}
              >
                Dashboard Vercel
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/status'}
              >
                Page Statut Public
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  runHealthChecks();
                  loadSystemStats();
                }}
                disabled={isChecking}
              >
                Forcer Diagnostic Complet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
