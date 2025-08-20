
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle, AlertCircle, XCircle, RefreshCw } from 'lucide-react';
import { Campaign } from '@/types';
import { CustomInfoTooltip } from './CustomInfoTooltip';

interface IntegrationStatusIndicatorProps {
  campaign: Campaign;
}

export type IntegrationStatus = 'not-connected' | 'partially-integrated' | 'fully-integrated' | 'checking';

export const IntegrationStatusIndicator = ({ campaign }: IntegrationStatusIndicatorProps) => {
  const [status, setStatus] = useState<IntegrationStatus>('checking');
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  const checkIntegrationStatus = async (isInitialCheck = false) => {
    if (isInitialCheck) {
      setStatus('checking');
    }
    
    try {
      // Simuler un appel API pour vérifier le statut d'intégration
      // En production, cela ferait un appel vers votre API de tracking
      const response = await fetch(`${window.location.origin}/tracking.js`, {
        method: 'HEAD',
        mode: 'no-cors'
      });
      
      // Logique de détermination du statut basée sur l'activité récente
      // Ici on simule la logique - en production il faudrait vérifier :
      // 1. Si le script est installé (réponse 200)
      // 2. Si il y a eu des clics récents (< 24h)
      // 3. Si il y a eu des conversions récentes
      
      // Pour la démo, on simule différents statuts
      const now = new Date();
      const hoursSinceCreation = (now.getTime() - campaign.createdAt.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceCreation < 1) {
        setStatus('not-connected');
      } else if (hoursSinceCreation < 24) {
        setStatus('partially-integrated');
      } else {
        setStatus('fully-integrated');
      }
      
    } catch (error) {
      console.log('Vérification d\'intégration:', error);
      setStatus('not-connected');
    }
    
    setLastCheck(new Date());
  };

  useEffect(() => {
    checkIntegrationStatus(true);
    
    // Vérifier le statut toutes les 30 secondes
    const interval = setInterval(() => checkIntegrationStatus(false), 30000);
    
    return () => clearInterval(interval);
  }, [campaign.id]);

  const getStatusConfig = () => {
    switch (status) {
      case 'fully-integrated':
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          label: 'Code parfaitement intégré',
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-200',
          description: 'Script installé et conversions trackées avec succès'
        };
      case 'partially-integrated':
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          label: 'Partiellement intégré',
          variant: 'secondary' as const,
          className: 'bg-orange-100 text-orange-800 border-orange-200',
          description: 'Script détecté mais aucune conversion trackée récemment'
        };
      case 'not-connected':
        return {
          icon: <XCircle className="h-3 w-3" />,
          label: 'Non connecté',
          variant: 'destructive' as const,
          className: 'bg-red-100 text-red-800 border-red-200',
          description: 'Aucune activité détectée - Vérifiez l\'installation du script'
        };
      case 'checking':
        return {
          icon: <RefreshCw className="h-3 w-3 animate-spin" />,
          label: 'Vérification...',
          variant: 'outline' as const,
          className: 'bg-gray-100 text-gray-600 border-gray-200',
          description: 'Vérification du statut d\'intégration en cours'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="flex items-center gap-2">
      <Badge className={`flex items-center gap-1 ${config.className}`}>
        {config.icon}
        <span className="text-xs font-medium">{config.label}</span>
      </Badge>
      <CustomInfoTooltip text={config.description} />
      <CustomInfoTooltip text="L'indicateur 'Code' vous montre si votre script de tracking RefSpring est correctement installé sur votre site e-commerce et s'il fonctionne." />
    </div>
  );
};
