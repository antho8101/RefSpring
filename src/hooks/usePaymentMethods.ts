
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { paymentMethodService, PaymentMethod } from '@/services/paymentMethodService';
import { campaignService, CampaignSummary } from '@/services/campaignService';
import { duplicateCardRemover } from '@/utils/duplicateCardRemover';

export const usePaymentMethods = () => {
  const { user } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadPaymentMethods();
    } else {
      // Réinitialiser les données si l'utilisateur n'est pas connecté
      setPaymentMethods([]);
      setCampaigns([]);
    }
  }, [user]);

  const loadPaymentMethods = async () => {
    if (!user?.email || !user?.uid) return;
    
    setLoading(true);
    try {
      console.log('🔄 REFRESH: Rechargement des cartes bancaires...');
      
      // 1. Charger les méthodes de paiement
      const methods = await paymentMethodService.getPaymentMethods(user.email);
      setPaymentMethods(methods);
      console.log('💳 REFRESH: Cartes chargées:', methods.length);
      
      // 2. Charger les campagnes
      const campaignsData = await campaignService.getCampaigns(user.uid);
      setCampaigns(campaignsData);
      console.log('🎯 REFRESH: Campagnes chargées:', campaignsData.length);
      
      console.log('✅ Cartes bancaires et campagnes rechargées avec succès');
    } catch (error) {
      console.error('❌ Erreur lors du rechargement des cartes:', error);
      setPaymentMethods([]);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const getLinkedCampaigns = (paymentMethodId: string): CampaignSummary[] => {
    return campaigns.filter(campaign => campaign.paymentMethodId === paymentMethodId);
  };

  const canDeletePaymentMethod = (paymentMethodId: string): { canDelete: boolean; reason?: string } => {
    const linkedCampaigns = getLinkedCampaigns(paymentMethodId);
    const activeCampaigns = linkedCampaigns.filter(c => c.isActive);
    
    // Si c'est la dernière carte et qu'il y a des campagnes actives liées
    if (paymentMethods.length === 1 && activeCampaigns.length > 0) {
      return {
        canDelete: false,
        reason: `Impossible de supprimer la dernière carte car ${activeCampaigns.length} campagne(s) active(s) y sont liées. Désactivez d'abord les campagnes.`
      };
    }

    // Si la carte a des campagnes actives liées et qu'aucune autre carte n'est disponible pour les campagnes
    if (activeCampaigns.length > 0) {
      const otherCards = paymentMethods.filter(pm => pm.id !== paymentMethodId);
      if (otherCards.length === 0) {
        return {
          canDelete: false,
          reason: `Cette carte est liée à ${activeCampaigns.length} campagne(s) active(s) et aucune autre carte n'est disponible.`
        };
      }
    }

    return { canDelete: true };
  };

  const deletePaymentMethod = async (paymentMethodId: string) => {
    // Vérifier si la suppression est autorisée
    const { canDelete, reason } = canDeletePaymentMethod(paymentMethodId);
    if (!canDelete) {
      throw new Error(reason);
    }

    setLoading(true);
    try {
      console.log('🗑️ DELETION: Suppression de la carte:', paymentMethodId);
      
      // 1. Supprimer la carte chez Stripe
      await paymentMethodService.deletePaymentMethod(paymentMethodId);
      console.log('✅ DELETION: Carte supprimée de Stripe');
      
      // 2. **IMPORTANT: Recharger complètement les données depuis Stripe**
      await loadPaymentMethods();
      console.log('✅ DELETION: Données rechargées depuis Stripe');
      
      console.log(`✅ Carte ${paymentMethodId} supprimée et données synchronisées`);
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
    canDeletePaymentMethod,
    deletePaymentMethod,
    refreshPaymentMethods: loadPaymentMethods,
    cleanupDuplicates,
  };
};
