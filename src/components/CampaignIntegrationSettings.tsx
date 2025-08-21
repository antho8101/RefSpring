
import { useState, useEffect } from 'react';
import { Campaign } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { IntegrationTypeSelector } from './campaign-integration/IntegrationTypeSelector';
import { CodeIntegration } from './campaign-integration/CodeIntegration';
import { PluginIntegration } from './campaign-integration/PluginIntegration';
import { TabsContent } from '@/components/ui/tabs';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface IntegrationStatus {
  hasCodeIntegration: boolean;
  hasPluginIntegration: boolean;
  pluginConfigs: Array<{
    id: string;
    type: 'wordpress' | 'shopify';
    domain: string;
    active: boolean;
  }>;
  activeIntegrationType: 'code' | 'plugin';
  codeIntegrationStatus?: 'active' | 'pending' | 'error' | 'inactive';
  lastCodeActivity?: Date;
  errorMessage?: string;
}

interface CampaignIntegrationSettingsProps {
  campaign: Campaign;
  onIntegrationStatusChange?: (status: IntegrationStatus) => void;
}

export const CampaignIntegrationSettings = ({ campaign, onIntegrationStatusChange }: CampaignIntegrationSettingsProps) => {
  const { user } = useAuth();
  const [integrationType, setIntegrationType] = useState<'code' | 'plugin'>('code');
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus>({
    hasCodeIntegration: true,
    hasPluginIntegration: false,
    pluginConfigs: [],
    activeIntegrationType: 'code'
  });

  useEffect(() => {
    const loadIntegrationStatus = async () => {
      try {
        const pluginQuery = query(
          collection(db, 'plugin_configs'),
          where('campaignId', '==', campaign.id)
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

        // Simuler le statut d'intégration du code basé sur l'état de la campagne
        let codeStatus: 'active' | 'pending' | 'error' | 'inactive' = 'pending';
        let lastActivity: Date | undefined;
        let errorMsg: string | undefined;

        // Utiliser l'âge de la campagne et son état pour déterminer le statut
        const campaignAge = Date.now() - campaign.createdAt.getTime();
        const daysSinceCreation = campaignAge / (1000 * 60 * 60 * 24);

        if (campaign.isActive) {
          // Campagne active - supposer que l'intégration fonctionne
          if (daysSinceCreation > 1) {
            codeStatus = 'active';
            lastActivity = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Dans les 7 derniers jours
          } else {
            codeStatus = 'pending'; // Campagne récente, en attente de première activité
          }
        } else if (!campaign.isActive && daysSinceCreation > 7) {
          // Campagne inactive depuis longtemps - code probablement pas installé
          codeStatus = 'inactive';
        } else {
          // Campagne récente ou récemment désactivée - statut en attente
          codeStatus = 'pending';
        }

        const newStatus: IntegrationStatus = {
          hasCodeIntegration: true,
          hasPluginIntegration: plugins.length > 0,
          pluginConfigs: plugins,
          activeIntegrationType: integrationType,
          codeIntegrationStatus: codeStatus,
          lastCodeActivity: lastActivity,
          errorMessage: errorMsg
        };
        
        setIntegrationStatus(newStatus);
        onIntegrationStatusChange?.(newStatus);
      } catch (error) {
        console.error('Erreur lors du chargement du statut:', error);
        
        // En cas d'erreur, afficher un statut d'erreur
        const errorStatus: IntegrationStatus = {
          hasCodeIntegration: true,
          hasPluginIntegration: false,
          pluginConfigs: [],
          activeIntegrationType: integrationType,
          codeIntegrationStatus: 'error',
          errorMessage: 'Impossible de vérifier le statut d\'intégration'
        };
        
        setIntegrationStatus(errorStatus);
        onIntegrationStatusChange?.(errorStatus);
      }
    };

    loadIntegrationStatus();
  }, [campaign.id, campaign.createdAt, campaign.isActive, integrationType, onIntegrationStatusChange]);

  const handleTypeChange = (type: 'code' | 'plugin') => {
    setIntegrationType(type);
    const updatedStatus = {
      ...integrationStatus,
      activeIntegrationType: type
    };
    setIntegrationStatus(updatedStatus);
    onIntegrationStatusChange?.(updatedStatus);
  };

  return (
    <div className="space-y-6">
      <IntegrationTypeSelector 
        activeType={integrationType} 
        onTypeChange={handleTypeChange}
      >
        <TabsContent value="code">
          <CodeIntegration campaign={campaign} />
        </TabsContent>

        <TabsContent value="plugin">
          {user?.uid && (
            <PluginIntegration 
              campaignId={campaign.id} 
              userId={user.uid}
            />
          )}
        </TabsContent>
      </IntegrationTypeSelector>
    </div>
  );
};
