
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

// Données simulées pour le développement
const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm_1234567890',
    type: 'card',
    last4: '4242',
    brand: 'visa',
    exp_month: 12,
    exp_year: 2025,
    isDefault: true,
  },
  {
    id: 'pm_0987654321',
    type: 'card',
    last4: '5555',
    brand: 'mastercard',
    exp_month: 6,
    exp_year: 2026,
  },
];

const mockCampaigns: Campaign[] = [
  {
    id: 'camp_1',
    name: 'Campagne E-commerce',
    isActive: true,
    paymentMethodId: 'pm_1234567890',
  },
  {
    id: 'camp_2',
    name: 'Campagne SaaS',
    isActive: true,
    paymentMethodId: 'pm_1234567890',
  },
  {
    id: 'camp_3',
    name: 'Campagne Blog',
    isActive: false,
    paymentMethodId: 'pm_0987654321',
  },
];

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
    setLoading(true);
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPaymentMethods(mockPaymentMethods);
      setCampaigns(mockCampaigns);
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
      // Simuler la suppression et la mise en pause des campagnes
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
