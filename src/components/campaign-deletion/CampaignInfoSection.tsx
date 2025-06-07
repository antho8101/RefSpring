
import { Campaign } from '@/types';
import { Calendar, Info } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { LastPaymentInfo } from '@/services/stripeConnectService';

interface CampaignInfoSectionProps {
  campaign: Campaign;
  lastPaymentInfo: LastPaymentInfo;
}

export const CampaignInfoSection = ({ campaign, lastPaymentInfo }: CampaignInfoSectionProps) => {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
      <h4 className="font-medium text-slate-900 mb-2">Campagne à supprimer</h4>
      <p className="text-slate-700 font-medium">{campaign.name}</p>
      <div className="text-sm text-slate-500 mt-1 flex items-center gap-1">
        {lastPaymentInfo.hasPayments ? (
          <>
            <Calendar className="h-4 w-4" />
            Dernier paiement : {format(lastPaymentInfo.lastPaymentDate!, 'dd MMMM yyyy', { locale: fr })}
          </>
        ) : (
          <>
            <Info className="h-4 w-4" />
            Aucun paiement précédent
          </>
        )}
      </div>
    </div>
  );
};
