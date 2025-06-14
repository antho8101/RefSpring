
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
      console.log('🔄 PRODUCTION: Création du setup de paiement pour la campagne:', campaignId);
      
      // Appel direct à l'API Vercel Edge Function
      const response = await fetch('/api/stripe/create-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId,
          campaignName,
          userEmail: user.email,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const setupData = await response.json();
      console.log('✅ PRODUCTION: Setup de paiement créé:', setupData);
      
      // Rediriger vers Stripe
      window.location.href = setupData.checkoutUrl;
      
      return setupData;
    } catch (err: any) {
      console.error('❌ PRODUCTION: Erreur setup paiement:', err);
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
      console.log('🔄 PRODUCTION: Vérification du statut pour:', setupIntentId);
      
      // Appel direct à l'API Vercel Edge Function
      const response = await fetch(`/api/stripe/check-setup?setupIntentId=${encodeURIComponent(setupIntentId)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ PRODUCTION: Statut vérifié:', result);
      return result;
    } catch (err: any) {
      console.error('❌ PRODUCTION: Erreur vérification statut:', err);
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
