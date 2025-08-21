
import { useState } from 'react';
import { Campaign } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { IntegrationTypeSelector } from './campaign-integration/IntegrationTypeSelector';
import { CodeIntegration } from './campaign-integration/CodeIntegration';
import { PluginIntegration } from './campaign-integration/PluginIntegration';
import { TabsContent } from '@/components/ui/tabs';

interface CampaignIntegrationSettingsProps {
  campaign: Campaign;
}

export const CampaignIntegrationSettings = ({ campaign }: CampaignIntegrationSettingsProps) => {
  const { user } = useAuth();
  const [integrationType, setIntegrationType] = useState<'code' | 'plugin'>('code');

  return (
    <div className="space-y-6">
      <IntegrationTypeSelector 
        activeType={integrationType} 
        onTypeChange={setIntegrationType}
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
