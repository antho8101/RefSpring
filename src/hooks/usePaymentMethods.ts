
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { stripeBackendService } from '@/services/stripeBackendService';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
    if (!user?.email || !user?.uid) return;
    
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
        isDefault: false,
      }));
      
      setPaymentMethods(formattedPaymentMethods);
      
      // 4. Récupérer les vraies campagnes depuis Firebase
      await loadCampaigns();
      
      console.log('✅ Cartes bancaires chargées avec succès');
    } catch (error) {
      console.error('❌ Erreur lors du chargement des cartes:', error);
      setPaymentMethods([]);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCampaigns = async () => {
    if (!user?.uid) return;
    
    try {
      console.log('🔍 Chargement des campagnes depuis Firebase pour:', user.uid);
      
      const campaignsQuery = query(
        collection(db, 'campaigns'),
        where('userId', '==', user.uid)
      );
      
      const campaignsSnapshot = await getDocs(campaignsQuery);
      
      const campaignsData = campaignsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || 'Campagne sans nom',
          isActive: !data.isDraft && data.paymentConfigured,
          paymentMethodId: data.stripePaymentMethodId, // Champ qui stocke l'ID de la carte
        };
      }) as Campaign[];
      
      console.log('✅ Campagnes chargées:', campaignsData.length);
      setCampaigns(campaignsData);
      
    } catch (error) {
      console.error('❌ Erreur chargement campagnes:', error);
      setCampaigns([]);
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
      
      // 4. Recharger les données pour s'assurer de la cohérence
      await loadCampaigns();
      
      console.log(`✅ Carte ${paymentMethodId} supprimée et campagnes associées mises à jour`);
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
