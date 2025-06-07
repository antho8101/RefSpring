
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { stripeBackendService } from '@/services/stripeBackendService';

interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  brand: string;
  exp_month: number;
  exp_year: number;
  isDefault?: boolean;
}

interface Campaign {
  id: string;
  name: string;
  isActive: boolean;
  paymentMethodId?: string;
}

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
    if (!user?.email) return;
    
    setLoading(true);
    try {
      console.log('🔍 Chargement des cartes bancaires pour:', user.email);
      
      // 1. Récupérer le client Stripe
      const customer = await stripeBackendService.createOrGetCustomer(user.email);
      console.log('✅ Client Stripe trouvé:', customer.id);
      
      // 2. Récupérer les méthodes de paiement du client
      const paymentMethodsData = await stripeBackendService.getCustomerPaymentMethods(customer.id);
      console.log('💳 Méthodes de paiement trouvées:', paymentMethodsData.length);
      
      // 3. Formatter les données pour l'interface
      const formattedPaymentMethods = paymentMethodsData.map((pm: any) => ({
        id: pm.id,
        type: pm.type,
        last4: pm.card?.last4 || '****',
        brand: pm.card?.brand || 'unknown',
        exp_month: pm.card?.exp_month || 0,
        exp_year: pm.card?.exp_year || 0,
        isDefault: false, // TODO: Gérer la carte par défaut
      }));
      
      setPaymentMethods(formattedPaymentMethods);
      
      // 4. TODO: Récupérer les campagnes liées depuis Firebase/Supabase
      // Pour l'instant, on utilise un tableau vide
      setCampaigns([]);
      
      console.log('✅ Cartes bancaires chargées avec succès');
    } catch (error) {
      console.error('❌ Erreur lors du chargement des cartes:', error);
      // En cas d'erreur, on initialise avec des tableaux vides
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
      console.log(`🗑️ Suppression de la carte ${paymentMethodId}`);
      
      // 1. Supprimer la carte chez Stripe
      await stripeBackendService.detachPaymentMethod(paymentMethodId);
      console.log('✅ Carte supprimée de Stripe');
      
      // 2. Mettre en pause les campagnes liées
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
      
      console.log(`✅ Carte ${paymentMethodId} supprimée et campagnes associées mises en pause`);
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error);
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
  };
};
