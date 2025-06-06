import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, XCircle, Clock, Activity, Database, Shield, Zap, RefreshCw } from "lucide-react";
import { useServiceHealth } from "@/hooks/useServiceHealth";
import { useIncidentMonitoring } from "@/hooks/useIncidentMonitoring";

const StatusPage = () => {
  const { healthChecks, isChecking, lastUpdate, runHealthChecks } = useServiceHealth();
  const { incidents, loading: incidentsLoading } = useIncidentMonitoring();
  const [overallStatus, setOverallStatus] = useState<'operational' | 'degraded' | 'outage'>('operational');

  useEffect(() => {
    if (healthChecks.length === 0) return;
    
    const hasOutage = healthChecks.some(check => check.status === 'outage');
    const hasDegraded = healthChecks.some(check => check.status === 'degraded' || check.status === 'maintenance');
    
    if (hasOutage) {
      setOverallStatus('outage');
    } else if (hasDegraded) {
      setOverallStatus('degraded');
    } else {
      setOverallStatus('operational');
    }
  }, [healthChecks]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'maintenance': return 'text-blue-600';
      case 'outage': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'degraded': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'maintenance': return <Clock className="w-5 h-5 text-blue-600" />;
      case 'outage': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      operational: 'default',
      degraded: 'secondary',
      maintenance: 'outline',
      outage: 'destructive'
    } as const;

    const labels = {
      operational: 'Opérationnel',
      degraded: 'Dégradé',
      maintenance: 'Maintenance',
      outage: 'Panne'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const getServiceIcon = (serviceName: string) => {
    switch (serviceName) {
      case 'API RefSpring': return Zap;
      case 'Dashboard Web': return Activity;
      case 'Base de données': return Database;
      case 'Authentification': return Shield;
      default: return Activity;
    }
  };

  const redirectToDashboard = () => {
    window.location.href = '/app';
  };

  return (
    <>
      <Helmet>
        <title>Statut des Services - RefSpring</title>
        <meta name="description" content="Vérifiez l'état en temps réel de tous les services RefSpring" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <LandingHeader onRedirectToDashboard={redirectToDashboard} currentPage="status" />
        
        <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* En-tête de statut global */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                {getStatusIcon(overallStatus)}
                <h1 className="text-3xl font-bold text-gray-900 ml-3">
                  Statut des Services RefSpring
                </h1>
              </div>
              <p className={`text-lg ${getStatusColor(overallStatus)}`}>
                {overallStatus === 'operational' && 'Tous les systèmes sont opérationnels'}
                {overallStatus === 'degraded' && 'Certains services connaissent des problèmes'}
                {overallStatus === 'outage' && 'Des services sont actuellement indisponibles'}
              </p>
              <div className="flex items-center justify-center gap-4 mt-4">
                <p className="text-sm text-gray-500">
                  Dernière mise à jour : {lastUpdate.toLocaleString('fr-FR')}
                </p>
                <Button
                  onClick={runHealthChecks}
                  disabled={isChecking}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                  {isChecking ? 'Vérification...' : 'Actualiser'}
                </Button>
              </div>
            </div>

            {/* Statut des services */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {healthChecks.map((check, index) => {
                    const IconComponent = getServiceIcon(check.name);
                    return (
                      <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <IconComponent className="w-6 h-6 text-gray-600" />
                          <div>
                            <h3 className="font-medium text-gray-900">{check.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>Temps de réponse: {check.responseTime}ms</span>
                              <span>•</span>
                              <span>Vérifié: {check.lastChecked.toLocaleTimeString('fr-FR')}</span>
                            </div>
                            {check.errorMessage && (
                              <p className="text-sm text-red-600 mt-1">{check.errorMessage}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(check.status)}
                          {getStatusIcon(check.status)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Incidents récents */}
            {!incidentsLoading && incidents.length > 0 ? (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    Incidents Récents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {incidents.map((incident) => (
                      <div key={incident.id} className="border-l-4 border-yellow-400 pl-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{incident.title}</h3>
                          <div className="flex gap-2">
                            <Badge variant={incident.severity === 'critical' ? 'destructive' : 'secondary'}>
                              {incident.severity}
                            </Badge>
                            <Badge variant="outline">
                              {incident.status}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{incident.description}</p>
                        <div className="space-y-2">
                          {incident.updates.map((update, updateIndex) => (
                            <div key={updateIndex} className="text-xs text-gray-500">
                              <span className="font-medium">{update.timestamp.toLocaleString('fr-FR')}</span> - {update.message}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun incident signalé</h3>
                  <p className="text-gray-500">Tous nos services fonctionnent normalement.</p>
                </CardContent>
              </Card>
            )}

            {/* Footer informatif */}
            <div className="mt-12 text-center text-sm text-gray-500">
              <p>Cette page vérifie automatiquement l'état des services toutes les 30 secondes.</p>
              <p className="mt-2">
                Des questions ? Contactez notre équipe support à{" "}
                <a href="mailto:support@refspring.com" className="text-blue-600 hover:underline">
                  support@refspring.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default StatusPage;
