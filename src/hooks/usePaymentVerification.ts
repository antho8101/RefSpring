
import { useState } from 'react';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useToast } from '@/hooks/use-toast';

export const usePaymentVerification = () => {
  const [showPaymentSelector, setShowPaymentSelector] = useState(false);
  const { paymentMethods, loading: paymentMethodsLoading, refreshPaymentMethods } = usePaymentMethods();
  const { updateCampaign } = useCampaigns();
  const { toast } = useToast();

  const verifyPaymentForReactivation = async (campaignId: string, formData: any, onFormDataChange: (data: any) => void) => {
    console.log('🔄 Tentative de réactivation - vérification des cartes...');
    
    try {
      await refreshPaymentMethods();
      
      if (paymentMethods.length === 0) {
        console.log('❌ Aucune carte disponible pour la réactivation');
        toast({
          title: "Impossible de réactiver",
          description: "Vous devez d'abord ajouter une carte bancaire pour réactiver cette campagne.",
          variant: "destructive",
        });
        
        setShowPaymentSelector(true);
        return false;
      }
      
      console.log('✅ Cartes disponibles, réactivation possible');
      return true;
      
    } catch (error) {
      console.error('❌ Erreur lors de la vérification des cartes:', error);
      toast({
        title: "Erreur",
        description: "Impossible de vérifier les cartes bancaires",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleCardSelection = async (cardId: string, campaignId: string, formData: any, onFormDataChange: (data: any) => void) => {
    try {
      console.log('💳 Association de la carte', cardId, 'à la campagne', campaignId);
      
      await updateCampaign(campaignId, {
        stripePaymentMethodId: cardId,
        isActive: true,
      });
      
      onFormDataChange({ ...formData, isActive: true });
      setShowPaymentSelector(false);
      
      toast({
        title: "✅ Parfait !",
        description: "La carte a été associée et la campagne a été réactivée !",
      });
      
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
    toast({
      title: "Redirection Stripe",
      description: "Fonctionnalité d'ajout de carte à implémenter",
    });
  };

  return {
    showPaymentSelector,
    setShowPaymentSelector,
    paymentMethods,
    paymentMethodsLoading,
    verifyPaymentForReactivation,
    handleCardSelection,
    handleAddNewCard,
  };
};
