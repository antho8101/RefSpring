

import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import { Campaign } from '@/types';
import { useStripePayment } from '@/hooks/useStripePayment';
import { useToast } from '@/hooks/use-toast';

interface CampaignPaymentSettingsProps {
  campaign: Campaign;
  onPaymentMethodChange: () => void;
}

export const CampaignPaymentSettings = ({ campaign, onPaymentMethodChange }: CampaignPaymentSettingsProps) => {
  const { setupPaymentForCampaign, loading } = useStripePayment();
  const { toast } = useToast();

  const handleSetupPayment = async () => {
    try {
      console.log('🔄 Configuration de la méthode de paiement pour:', campaign.name);
      await setupPaymentForCampaign(campaign.id, campaign.name);
    } catch (error: any) {
      console.error('❌ Erreur configuration paiement:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de configurer la méthode de paiement",
        variant: "destructive",
      });
    }
  };

  const hasPaymentMethod = Boolean(campaign.stripeCustomerId);

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
            onClick={hasPaymentMethod ? onPaymentMethodChange : handleSetupPayment}
            disabled={loading}
            className="rounded-xl"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            {loading ? 'Configuration...' : hasPaymentMethod ? 'Changer' : 'Configurer'}
          </Button>
        </div>
      </div>
    </div>
  );
};

