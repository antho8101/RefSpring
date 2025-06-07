
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

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
      // TODO: Implémenter l'appel API pour récupérer les vraies cartes bancaires
      // Pour l'instant, on initialise avec un tableau vide
      setPaymentMethods([]);
      setCampaigns([]);
      
      console.log('Chargement des cartes bancaires pour:', user.email);
    } catch (error) {
      console.error('Erreur lors du chargement des cartes:', error);
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
      // TODO: Implémenter l'appel API pour supprimer la carte
      console.log(`Suppression de la carte ${paymentMethodId}`);
      
      // Mettre en pause les campagnes liées
      setCampaigns(prev => 
        prev.map(campaign => 
          campaign.paymentMethodId === paymentMethodId
            ? { ...campaign, isActive: false, paymentMethodId: undefined }
            : campaign
        )
      );
      
      // Supprimer la carte
      setPaymentMethods(prev => 
        prev.filter(pm => pm.id !== paymentMethodId)
      );
      
      console.log(`Carte ${paymentMethodId} supprimée et campagnes associées mises en pause`);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
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
