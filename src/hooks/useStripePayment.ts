
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';

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
      console.log('🔄 FIREBASE: Création du setup de paiement pour la campagne:', campaignId);
      
      // Si c'est pour une nouvelle campagne, stocker les données en local
      if (campaignId === 'temp_new_campaign') {
        const pendingData = localStorage.getItem('pendingCampaignData');
        console.log('💾 Données campagne stockées pour après validation Stripe:', pendingData);
      }
      
      // Appel à la fonction Firebase
      const createSetup = httpsCallable(functions, 'stripeCreateSetup');
      const result = await createSetup({
        campaignId,
        campaignName,
        userEmail: user.email,
      });

      const setupData = result.data as any;
      console.log('✅ FIREBASE: Setup de paiement créé:', setupData);
      
      // Rediriger vers Stripe
      window.location.href = setupData.checkoutUrl;
      
      return setupData;
    } catch (err: any) {
      console.error('❌ FIREBASE: Erreur setup paiement:', err);
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
      console.log('🔄 FIREBASE: Vérification du setup pour:', setupIntentId);
      
      // Appel à la fonction Firebase
      const checkSetup = httpsCallable(functions, 'stripeCheckSetup');
      const result = await checkSetup({ setupIntentId });
      
      const data = result.data as any;
      console.log('✅ FIREBASE: Setup vérifié et finalisé:', data);
      
      // **IMPORTANT: Retourner aussi le paymentMethodId pour la finalisation**
      return {
        ...data,
        paymentMethodId: data.paymentMethodId
      };
    } catch (err: any) {
      console.error('❌ FIREBASE: Erreur vérification setup:', err);
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
