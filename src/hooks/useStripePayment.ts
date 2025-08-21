
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export const useStripePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const setupPaymentForCampaign = async (campaignId: string, campaignName: string) => {
    if (!user?.email) {
      throw new Error('Utilisateur non connecté');
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 API: Création du setup de paiement pour la campagne:', campaignId);
      
      // Si c'est pour une nouvelle campagne, stocker les données en local
      if (campaignId === 'temp_new_campaign') {
        const pendingData = localStorage.getItem('pendingCampaignData');
        console.log('💾 Données campagne stockées pour après validation Stripe:', pendingData);
      }
      
      // Appel à l'API Vercel
      const response = await fetch('/api/stripe-setup-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userEmail: user.email, 
          campaignName 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create setup intent');
      }
      
      const setupData = await response.json();
      console.log('✅ API: Setup de paiement créé:', setupData);
      
      // Retourner les données pour utilisation avec Stripe Elements
      return setupData;
    } catch (err: any) {
      console.error('❌ API: Erreur setup paiement:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyPaymentSetup = async (setupIntentId: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 API: Vérification du setup pour:', setupIntentId);
      
      // Appel à l'API Vercel
      const response = await fetch('/api/stripe-check-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ setupIntentId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to verify setup intent');
      }
      
      const data = await response.json();
      console.log('✅ API: Setup vérifié et finalisé:', data);
      
      // **IMPORTANT: Retourner aussi le paymentMethodId pour la finalisation**
      return {
        ...data,
        paymentMethodId: data.paymentMethodId
      };
    } catch (err: any) {
      console.error('❌ API: Erreur vérification setup:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    setupPaymentForCampaign,
    verifyPaymentSetup,
    loading,
    error,
  };
};
