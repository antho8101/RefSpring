
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Code, Globe, ShoppingBag, AlertTriangle, XCircle, Clock } from 'lucide-react';

interface IntegrationStatus {
  hasCodeIntegration: boolean;
  hasPluginIntegration: boolean;
  pluginConfigs: Array<{
    id: string;
    type: 'wordpress' | 'shopify';
    domain: string;
    active: boolean;
  }>;
  activeIntegrationType?: 'code' | 'plugin';
  codeIntegrationStatus?: 'active' | 'pending' | 'error' | 'inactive';
  lastCodeActivity?: Date;
  errorMessage?: string;
}

interface CampaignSettingsHeaderProps {
  activeTab: string;
  integrationStatus?: IntegrationStatus;
}

export const CampaignSettingsHeader = ({ activeTab, integrationStatus }: CampaignSettingsHeaderProps) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'general':
        return 'Paramètres généraux';
      case 'integration':
        return 'Intégration';
      case 'payment':
        return 'Méthode de paiement';
      case 'affiliates':
        return 'Gestion des affiliés';
      default:
        return 'Paramètres';
    }
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case 'general':
        return 'Configurez les informations de base de votre campagne';
      case 'integration':
        return getIntegrationDescription();
      case 'payment':
        return 'Gérez votre méthode de paiement pour les commissions';
      case 'affiliates':
        return 'Gérez tous les affiliés de cette campagne';
      default:
        return '';
    }
  };

  const getIntegrationDescription = () => {
    if (!integrationStatus) {
      return 'Configurez le tracking d\'affiliation sur votre site';
    }

    const { activeIntegrationType, pluginConfigs } = integrationStatus;
    
    if (activeIntegrationType === 'code') {
      return 'Intégration par code - Scripts prêts à être déployés';
    } else {
      const activePlugins = pluginConfigs.filter(p => p.active);
      if (activePlugins.length > 0) {
        return `Plugin${activePlugins.length > 1 ? 's' : ''} configuré${activePlugins.length > 1 ? 's' : ''} - ${activePlugins.length} site${activePlugins.length > 1 ? 's' : ''} connecté${activePlugins.length > 1 ? 's' : ''}`;
      }
      return 'Configuration des plugins CMS';
    }
  };

  const renderIntegrationStatus = () => {
    if (activeTab !== 'integration' || !integrationStatus) {
      return null;
    }

    const { activeIntegrationType, pluginConfigs, codeIntegrationStatus, lastCodeActivity, errorMessage } = integrationStatus;
    
    if (activeIntegrationType === 'code') {
      const status = codeIntegrationStatus || 'pending';
      
      return (
        <div className="flex items-center gap-3 mt-4">
          {/* Indicateur de statut */}
          <div className="flex items-center gap-2">
            {status === 'active' && (
              <>
                <div className="relative">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <Code className="h-4 w-4 text-green-600" />
              </>
            )}
            {status === 'pending' && (
              <>
                <Clock className="h-5 w-5 text-amber-500" />
                <Code className="h-4 w-4 text-amber-500" />
              </>
            )}
            {status === 'error' && (
              <>
                <XCircle className="h-5 w-5 text-red-500" />
                <Code className="h-4 w-4 text-red-500" />
              </>
            )}
            {status === 'inactive' && (
              <>
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <Code className="h-4 w-4 text-orange-500" />
              </>
            )}
          </div>

          {/* Badge de statut */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              {status === 'active' && (
                <Badge className="bg-green-100 text-green-800 border-green-200 text-xs font-medium">
                  ✅ Code intégré et fonctionnel
                </Badge>
              )}
              {status === 'pending' && (
                <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs font-medium">
                  ⏳ Code en attente de déploiement
                </Badge>
              )}
              {status === 'error' && (
                <Badge className="bg-red-100 text-red-800 border-red-200 text-xs font-medium">
                  ❌ Erreur d'intégration
                </Badge>
              )}
              {status === 'inactive' && (
                <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs font-medium">
                  ⚠️ Code non déployé
                </Badge>
              )}
            </div>
            
            {/* Message d'erreur ou info supplémentaire */}
            {status === 'error' && errorMessage && (
              <p className="text-xs text-red-600 mt-1">
                {errorMessage}
              </p>
            )}
            {status === 'active' && lastCodeActivity && (
              <p className="text-xs text-green-600 mt-1">
                Dernière activité: {new Date(lastCodeActivity).toLocaleDateString('fr-FR')}
              </p>
            )}
            {status === 'pending' && (
              <p className="text-xs text-amber-600 mt-1">
                Vérifiez que le code est bien installé sur votre site
              </p>
            )}
            {status === 'inactive' && (
              <p className="text-xs text-orange-600 mt-1">
                Aucune activité détectée - Vérifiez l'installation
              </p>
            )}
          </div>
        </div>
      );
    } else {
      const activePlugins = pluginConfigs.filter(p => p.active);
      if (activePlugins.length > 0) {
        return (
          <div className="flex items-center gap-3 mt-4">
            <div className="relative">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {activePlugins.map((plugin) => (
                <Badge key={plugin.id} className="bg-green-100 text-green-800 border-green-200 text-xs flex items-center gap-1 font-medium">
                  {plugin.type === 'wordpress' ? <Globe className="h-3 w-3" /> : <ShoppingBag className="h-3 w-3" />}
                  ✅ {plugin.domain}
                </Badge>
              ))}
            </div>
          </div>
        );
      }
      return null;
    }
  };

  return (
    <div className="p-8 border-b bg-white">
      <h3 className="text-2xl font-semibold text-slate-900">{getTabTitle()}</h3>
      <p className="text-slate-600 mt-2">{getTabDescription()}</p>
      {renderIntegrationStatus()}
    </div>
  );
};
