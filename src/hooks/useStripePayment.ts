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
      console.log('🔄 SUPABASE: Création du setup de paiement pour la campagne:', campaignId);
      
      // Si c'est pour une nouvelle campagne, stocker les données en local
      if (campaignId === 'temp_new_campaign') {
        const pendingData = localStorage.getItem('pendingCampaignData');
        console.log('💾 Données campagne stockées pour après validation Stripe:', pendingData);
      }
      
      // Utiliser Supabase Edge Function au lieu de l'API Vercel
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data: setupData, error: supabaseError } = await supabase.functions.invoke('stripe-setup-intent', {
        body: { 
          campaignName 
        }
      });
      
      if (supabaseError) {
        console.error('❌ SUPABASE: Erreur setup paiement:', supabaseError);
        throw new Error(supabaseError.message || 'Failed to create setup intent');
      }
      
      console.log('✅ SUPABASE: Setup de paiement créé:', setupData);
      
      // Retourner les données pour utilisation avec Stripe Elements
      return setupData;
    } catch (err: any) {
      console.error('❌ SUPABASE: Erreur setup paiement:', err);
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
      console.log('🔄 SUPABASE: Vérification du setup pour:', setupIntentId);
      
      // Utiliser Supabase Edge Function au lieu de l'API Vercel
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error: supabaseError } = await supabase.functions.invoke('stripe-check-setup', {
        body: { setupIntentId }
      });
      
      if (supabaseError) {
        console.error('❌ SUPABASE: Erreur vérification setup:', supabaseError);
        throw new Error(supabaseError.message || 'Failed to verify setup intent');
      }
      
      console.log('✅ SUPABASE: Setup vérifié et finalisé:', data);
      
      // **IMPORTANT: Retourner aussi le paymentMethodId pour la finalisation**
      return {
        ...data,
        paymentMethodId: data.paymentMethodId
      };
    } catch (err: any) {
      console.error('❌ SUPABASE: Erreur vérification setup:', err);
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