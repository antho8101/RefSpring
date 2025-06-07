
import { Button } from '@/components/ui/button';
import { CreditCard, CheckCircle } from 'lucide-react';
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
      <div className={`border rounded-xl p-6 ${hasPaymentMethod ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {hasPaymentMethod ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <CreditCard className="h-6 w-6 text-slate-500" />
            )}
            <div>
              <p className={`font-medium text-lg ${hasPaymentMethod ? 'text-green-900' : 'text-slate-900'}`}>
                {hasPaymentMethod ? 'Méthode de paiement configurée' : 'Aucune méthode de paiement'}
              </p>
              <p className={`mt-1 ${hasPaymentMethod ? 'text-green-700' : 'text-slate-600'}`}>
                {hasPaymentMethod 
                  ? "Une carte de paiement est associée à cette campagne pour les commissions" 
                  : "Configurez une carte de paiement pour pouvoir verser les commissions aux affiliés"
                }
              </p>
            </div>
          </div>
          
          <Button
            type="button"
            variant={hasPaymentMethod ? "outline" : "default"}
            onClick={hasPaymentMethod ? onPaymentMethodChange : handleSetupPayment}
            disabled={loading}
            className="rounded-xl"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            {loading ? 'Configuration...' : hasPaymentMethod ? 'Modifier' : 'Configurer'}
          </Button>
        </div>
      </div>

      {hasPaymentMethod && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center mt-0.5">
              <CheckCircle className="h-3 w-3 text-white" />
            </div>
            <div className="text-sm">
              <p className="text-blue-800 font-medium">Méthode de paiement active</p>
              <p className="text-blue-700">
                Vous pouvez maintenant verser les commissions à vos affiliés. 
                Les paiements seront prélevés automatiquement sur cette carte.
              </p>
            </div>
          </div>
        </div>
      )}

      {!hasPaymentMethod && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <CreditCard className="h-5 w-5 text-orange-600 mt-0.5" />
            <div className="text-sm">
              <p className="text-orange-800 font-medium">Configuration requise</p>
              <p className="text-orange-700">
                Pour pouvoir verser des commissions à vos affiliés, vous devez d'abord configurer 
                une méthode de paiement via Stripe.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
