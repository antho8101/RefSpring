
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createPaymentSetup, checkPaymentSetupStatus } from '@/utils/stripeUtils';

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
      console.log('🔄 Création du setup de paiement pour la campagne:', campaignId);
      
      const setupData = await createPaymentSetup({
        campaignId,
        campaignName,
        userEmail: user.email,
      });

      console.log('✅ Setup de paiement créé:', setupData);
      
      // Rediriger vers Stripe
      window.location.href = setupData.checkoutUrl;
      
      return setupData;
    } catch (err: any) {
      console.error('❌ Erreur setup paiement:', err);
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
      const status = await checkPaymentSetupStatus(setupIntentId);
      return status;
    } catch (err: any) {
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
