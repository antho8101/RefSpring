
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ServiceHealthCheck } from '@/hooks/useServiceHealth';

interface ServiceHealthListProps {
  healthChecks: ServiceHealthCheck[];
}

export const ServiceHealthList = ({ healthChecks }: ServiceHealthListProps) => {
  return (
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
  );
};
