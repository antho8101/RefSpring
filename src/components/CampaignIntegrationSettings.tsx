
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

        const newStatus: IntegrationStatus = {
          hasCodeIntegration: true,
          hasPluginIntegration: plugins.length > 0,
          pluginConfigs: plugins,
          activeIntegrationType: integrationType
        };
        
        setIntegrationStatus(newStatus);
        onIntegrationStatusChange?.(newStatus);
      } catch (error) {
        console.error('Erreur lors du chargement du statut:', error);
      }
    };

    loadIntegrationStatus();
  }, [campaign.id, integrationType, onIntegrationStatusChange]);

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
