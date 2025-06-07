
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { paymentMethodService, PaymentMethod } from '@/services/paymentMethodService';
import { campaignService, Campaign } from '@/services/campaignService';
import { duplicateCardRemover } from '@/utils/duplicateCardRemover';

export const usePaymentMethods = () => {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadPaymentMethods();
    }
  }, [user]);

  const loadPaymentMethods = async () => {
    if (!user?.email || !user?.uid) return;
    
    setLoading(true);
    try {
      // 1. Charger les méthodes de paiement
      const methods = await paymentMethodService.getPaymentMethods(user.email);
      setPaymentMethods(methods);
      
      // 2. Charger les campagnes
      const campaignsData = await campaignService.getCampaigns(user.uid);
      setCampaigns(campaignsData);
      
      console.log('✅ Cartes bancaires et campagnes chargées avec succès');
    } catch (error) {
      console.error('❌ Erreur lors du chargement des cartes:', error);
      setPaymentMethods([]);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const getLinkedCampaigns = (paymentMethodId: string): Campaign[] => {
    return campaigns.filter(campaign => campaign.paymentMethodId === paymentMethodId);
  };

  const deletePaymentMethod = async (paymentMethodId: string) => {
    setLoading(true);
    try {
      // 1. Supprimer la carte chez Stripe
      await paymentMethodService.deletePaymentMethod(paymentMethodId);
      
      // 2. Mettre à jour l'état local des campagnes
      setCampaigns(prev => 
        prev.map(campaign => 
          campaign.paymentMethodId === paymentMethodId
            ? { ...campaign, isActive: false, paymentMethodId: undefined }
            : campaign
        )
      );
      
      // 3. Supprimer la carte de l'état local
      setPaymentMethods(prev => 
        prev.filter(pm => pm.id !== paymentMethodId)
      );
      
      // 4. Recharger les campagnes pour s'assurer de la cohérence
      if (user?.uid) {
        const campaignsData = await campaignService.getCampaigns(user.uid);
        setCampaigns(campaignsData);
      }
      
      console.log(`✅ Carte ${paymentMethodId} supprimée et campagnes associées mises à jour`);
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const cleanupDuplicates = async (): Promise<number> => {
    if (!user?.email || !user?.uid) return 0;
    
    setLoading(true);
    try {
      const removedCount = await duplicateCardRemover.cleanupDuplicatesForUser(user.email);
      
      // Recharger les données mises à jour
      await loadPaymentMethods();
      
      return removedCount;
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    paymentMethods,
    campaigns,
    loading,
    getLinkedCampaigns,
    deletePaymentMethod,
    refreshPaymentMethods: loadPaymentMethods,
    cleanupDuplicates,
  };
};
