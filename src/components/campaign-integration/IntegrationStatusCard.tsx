import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Code, Globe, ShoppingBag } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface IntegrationStatusCardProps {
  campaignId: string;
  activeIntegrationType: 'code' | 'plugin';
}

interface IntegrationStatus {
  hasCodeIntegration: boolean;
  hasPluginIntegration: boolean;
  pluginConfigs: Array<{
    id: string;
    type: 'wordpress' | 'shopify';
    domain: string;
    active: boolean;
  }>;
}

export const IntegrationStatusCard = ({ campaignId, activeIntegrationType }: IntegrationStatusCardProps) => {
  const [status, setStatus] = useState<IntegrationStatus>({
    hasCodeIntegration: false,
    hasPluginIntegration: false,
    pluginConfigs: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadIntegrationStatus = async () => {
      try {
        // Vérifier les plugins configurés
        const pluginQuery = query(
          collection(db, 'plugin_configs'),
          where('campaignId', '==', campaignId)
        );
        
        const pluginSnapshot = await getDocs(pluginQuery);
        const plugins = pluginSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Array<{
          id: string;
          type: 'wordpress' | 'shopify';
          domain: string;
          active: boolean;
        }>;

        // Pour l'intégration par code, on considère qu'elle est toujours disponible
        // car elle ne nécessite pas de configuration côté serveur
        setStatus({
          hasCodeIntegration: true,
          hasPluginIntegration: plugins.length > 0,
          pluginConfigs: plugins
        });
      } catch (error) {
        console.error('Erreur lors du chargement du statut:', error);
      } finally {
        setLoading(false);
      }
    };

    loadIntegrationStatus();
  }, [campaignId]);

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-4 w-4 animate-pulse bg-muted rounded-full" />
            <div className="h-4 w-32 animate-pulse bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusForCurrentType = () => {
    if (activeIntegrationType === 'code') {
      return {
        isConnected: status.hasCodeIntegration,
        title: 'Intégration par code',
        description: 'Scripts prêts à être intégrés sur votre site',
        icon: <Code className="h-4 w-4" />
      };
    } else {
      const activePlugins = status.pluginConfigs.filter(p => p.active);
      return {
        isConnected: activePlugins.length > 0,
        title: `Plugin${activePlugins.length > 1 ? 's' : ''} configuré${activePlugins.length > 1 ? 's' : ''}`,
        description: activePlugins.length > 0 
          ? `${activePlugins.length} site${activePlugins.length > 1 ? 's' : ''} connecté${activePlugins.length > 1 ? 's' : ''}`
          : 'Aucun plugin configuré',
        icon: activePlugins.length > 0 ? (
          activePlugins[0].type === 'wordpress' ? <Globe className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />
        ) : <AlertCircle className="h-4 w-4" />,
        connectedSites: activePlugins
      };
    }
  };

  const currentStatus = getStatusForCurrentType();

  return (
    <Card className="mb-6 border-l-4" style={{ borderLeftColor: currentStatus.isConnected ? 'hsl(var(--success))' : 'hsl(var(--warning))' }}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {currentStatus.isConnected ? (
              <CheckCircle className="h-5 w-5 text-success" />
            ) : (
              <AlertCircle className="h-5 w-5 text-warning" />
            )}
            <div>
              <div className="flex items-center gap-2 mb-1">
                {currentStatus.icon}
                <h4 className="font-medium text-foreground">{currentStatus.title}</h4>
              </div>
              <p className="text-sm text-muted-foreground">{currentStatus.description}</p>
              
              {activeIntegrationType === 'plugin' && currentStatus.connectedSites && currentStatus.connectedSites.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {currentStatus.connectedSites.map((site) => (
                    <Badge key={site.id} variant="secondary" className="text-xs">
                      {site.type === 'wordpress' ? <Globe className="h-3 w-3 mr-1" /> : <ShoppingBag className="h-3 w-3 mr-1" />}
                      {site.domain}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <Badge variant={currentStatus.isConnected ? "default" : "secondary"}>
            {currentStatus.isConnected ? "Configuré" : "Non configuré"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};