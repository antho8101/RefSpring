
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { UnifiedHeader } from "@/components/shared/UnifiedHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle, Clock, Activity, Database, Shield, Zap } from "lucide-react";

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'outage' | 'maintenance';
  description: string;
  icon: any;
  lastUpdated: string;
}

interface Incident {
  id: string;
  title: string;
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved';
  severity: 'minor' | 'major' | 'critical';
  description: string;
  createdAt: string;
  updates: {
    time: string;
    message: string;
    status: string;
  }[];
}

const StatusPage = () => {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: "API RefSpring",
      status: "operational",
      description: "Toutes les fonctionnalités API fonctionnent normalement",
      icon: Zap,
      lastUpdated: new Date().toISOString()
    },
    {
      name: "Dashboard Web",
      status: "operational", 
      description: "Interface utilisateur accessible et fonctionnelle",
      icon: Activity,
      lastUpdated: new Date().toISOString()
    },
    {
      name: "Base de données",
      status: "operational",
      description: "Stockage et récupération des données opérationnels",
      icon: Database,
      lastUpdated: new Date().toISOString()
    },
    {
      name: "Authentification",
      status: "operational",
      description: "Connexion et sécurité des comptes fonctionnelles",
      icon: Shield,
      lastUpdated: new Date().toISOString()
    }
  ]);

  const [incidents, setIncidents] = useState<Incident[]>([]);

  const [overallStatus, setOverallStatus] = useState<'operational' | 'degraded' | 'outage'>('operational');

  useEffect(() => {
    // Simuler une vérification périodique du statut
    const checkStatus = () => {
      // En production, ceci ferait des appels API réels
      const hasOutage = services.some(s => s.status === 'outage');
      const hasDegraded = services.some(s => s.status === 'degraded' || s.status === 'maintenance');
      
      if (hasOutage) {
        setOverallStatus('outage');
      } else if (hasDegraded) {
        setOverallStatus('degraded');
      } else {
        setOverallStatus('operational');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Vérifier toutes les 30 secondes

    return () => clearInterval(interval);
  }, [services]);

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
        <UnifiedHeader onRedirectToDashboard={redirectToDashboard} currentPage="status" />
        
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
              <p className="text-sm text-gray-500 mt-2">
                Dernière mise à jour : {new Date().toLocaleString('fr-FR')}
              </p>
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
                  {services.map((service, index) => {
                    const IconComponent = service.icon;
                    return (
                      <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <IconComponent className="w-6 h-6 text-gray-600" />
                          <div>
                            <h3 className="font-medium text-gray-900">{service.name}</h3>
                            <p className="text-sm text-gray-500">{service.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(service.status)}
                          {getStatusIcon(service.status)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Incidents récents */}
            {incidents.length > 0 ? (
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
                          <Badge variant={incident.severity === 'critical' ? 'destructive' : 'secondary'}>
                            {incident.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{incident.description}</p>
                        <div className="space-y-2">
                          {incident.updates.map((update, updateIndex) => (
                            <div key={updateIndex} className="text-xs text-gray-500">
                              <span className="font-medium">{update.time}</span> - {update.message}
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
              <p>Cette page est mise à jour automatiquement toutes les 30 secondes.</p>
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
