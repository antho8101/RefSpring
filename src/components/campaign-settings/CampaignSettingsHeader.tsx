
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Code, Globe, ShoppingBag } from 'lucide-react';

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

    const { activeIntegrationType, pluginConfigs } = integrationStatus;
    
    if (activeIntegrationType === 'code') {
      return (
        <div className="flex items-center gap-2 mt-3">
          <CheckCircle className="h-4 w-4 text-success" />
          <Code className="h-4 w-4" />
          <Badge variant="default" className="text-xs">
            Intégration par code
          </Badge>
        </div>
      );
    } else {
      const activePlugins = pluginConfigs.filter(p => p.active);
      if (activePlugins.length > 0) {
        return (
          <div className="flex items-center gap-2 mt-3">
            <CheckCircle className="h-4 w-4 text-success" />
            <div className="flex flex-wrap items-center gap-2">
              {activePlugins.map((plugin) => (
                <Badge key={plugin.id} variant="default" className="text-xs flex items-center gap-1">
                  {plugin.type === 'wordpress' ? <Globe className="h-3 w-3" /> : <ShoppingBag className="h-3 w-3" />}
                  {plugin.domain}
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
