
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import { Campaign } from '@/types';
import { useStripePayment } from '@/hooks/useStripePayment';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { PaymentMethodSelector } from '@/components/PaymentMethodSelector';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useToast } from '@/hooks/use-toast';

interface CampaignPaymentSettingsProps {
  campaign: Campaign;
  onPaymentMethodChange: () => void;
}

export const CampaignPaymentSettings = ({ campaign, onPaymentMethodChange }: CampaignPaymentSettingsProps) => {
  const { setupPaymentForCampaign, loading } = useStripePayment();
  const { paymentMethods, loading: paymentMethodsLoading } = usePaymentMethods();
  const { updateCampaign } = useCampaigns();
  const { toast } = useToast();
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);

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

  const handleChangePaymentMethod = () => {
    if (paymentMethods.length === 0) {
      // Si aucune carte disponible, rediriger vers la configuration
      handleSetupPayment();
    } else {
      // Sinon, montrer le sélecteur de cartes
      setShowPaymentSelector(true);
    }
  };

  const handleCardSelection = async (cardId: string) => {
    try {
      console.log('🔄 Association de la carte', cardId, 'à la campagne', campaign.id);
      
      // Mettre à jour la campagne avec la nouvelle carte
      await updateCampaign(campaign.id, {
        stripePaymentMethodId: cardId,
        isActive: true, // Réactiver automatiquement la campagne
      });
      
      setShowPaymentSelector(false);
      
      toast({
        title: "✅ Parfait !",
        description: "La carte a été associée à votre campagne et celle-ci a été réactivée !",
      });
      
      // Déclencher la callback pour rafraîchir les données
      onPaymentMethodChange();
      
    } catch (error: any) {
      console.error('❌ Erreur association carte:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'associer la carte à la campagne",
        variant: "destructive",
      });
    }
  };

  const handleAddNewCard = () => {
    setShowPaymentSelector(false);
    handleSetupPayment();
  };

  const hasPaymentMethod = Boolean(campaign.stripeCustomerId);

  return (
    <>
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
              onClick={handleChangePaymentMethod}
              disabled={loading || paymentMethodsLoading}
              className="rounded-xl"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {loading || paymentMethodsLoading ? 'Configuration...' : hasPaymentMethod ? 'Changer' : 'Configurer'}
            </Button>
          </div>
        </div>
      </div>

      <PaymentMethodSelector
        open={showPaymentSelector}
        onOpenChange={setShowPaymentSelector}
        paymentMethods={paymentMethods}
        onSelectCard={handleCardSelection}
        onAddNewCard={handleAddNewCard}
        loading={loading}
      />
    </>
  );
};
