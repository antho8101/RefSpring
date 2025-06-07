
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import { Campaign } from '@/types';

interface CampaignPaymentSettingsProps {
  campaign: Campaign;
  onPaymentMethodChange: () => void;
}

export const CampaignPaymentSettings = ({ campaign, onPaymentMethodChange }: CampaignPaymentSettingsProps) => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-slate-900 text-lg">Carte de paiement configurée</p>
            <p className="text-slate-600 mt-1">
              {campaign.stripeCustomerId ? 
                "Une méthode de paiement est associée à cette campagne" : 
                "Aucune méthode de paiement configurée"
              }
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={onPaymentMethodChange}
            className="rounded-xl"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Changer
          </Button>
        </div>
      </div>
    </div>
  );
};
