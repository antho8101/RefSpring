
import { Activity, AlertTriangle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  issues: string[];
  lastCheck: Date;
}

interface SystemStatusCardProps {
  systemHealth: SystemHealth;
  isChecking: boolean;
  onRefresh: () => void;
}

export const SystemStatusCard = ({ systemHealth, isChecking, onRefresh }: SystemStatusCardProps) => {
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

  return (
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
            onClick={onRefresh}
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
  );
};
