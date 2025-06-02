
import { Campaign } from '@/types';
import { useCampaignStats } from '@/hooks/useCampaignStats';
import { CampaignInfoCards } from '@/components/CampaignInfoCards';
import { CampaignMetricsCards } from '@/components/CampaignMetricsCards';

interface CampaignStatsProps {
  campaign: Campaign;
  affiliatesCount: number;
}

export const CampaignStats = ({ campaign, affiliatesCount }: CampaignStatsProps) => {
  const { stats, loading } = useCampaignStats(campaign.id);

  return (
    <div className="space-y-6 mb-6">
      {/* URL Cible, Date de création et Dashboard public */}
      <CampaignInfoCards campaign={campaign} />

      {/* Statistiques détaillées */}
      <CampaignMetricsCards stats={stats} loading={loading} />
    </div>
  );
};
