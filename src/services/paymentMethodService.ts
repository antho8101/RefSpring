export interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  brand: string;
  exp_month: number;
  exp_year: number;
  isDefault?: boolean;
}

export const paymentMethodService = {
  async getPaymentMethods(userEmail: string): Promise<PaymentMethod[]> {
    console.log('🔍 SUPABASE: Chargement des cartes bancaires pour:', userEmail);
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Utiliser POST sans action pour déclencher le GET dans la fonction Edge
      const { data, error } = await supabase.functions.invoke('stripe-payment-methods', {
        body: {} // POST vide pour déclencher handleGetPaymentMethods
      });
      
      if (!error && data?.paymentMethods) {
        console.log('✅ SUPABASE: Cartes bancaires chargées:', data?.paymentMethods?.length || 0);
        
        // Mapper les données pour correspondre à l'interface PaymentMethod
        const paymentMethods = data?.paymentMethods?.map((pm: any) => ({
          id: pm.id,
          type: pm.type,
          last4: pm.card?.last4 || '',
          brand: pm.card?.brand || '',
          exp_month: pm.card?.exp_month || 0,
          exp_year: pm.card?.exp_year || 0,
          isDefault: pm.isDefault || false
        })) || [];
        
        return paymentMethods;
      } else {
        console.warn('⚠️ SUPABASE Edge Function failed, trying fallback API');
      }
    } catch (supabaseError) {
      console.warn('⚠️ SUPABASE Edge Function error, trying fallback API:', supabaseError);
    }

    // Fallback to old API endpoint if Supabase fails
    try {
      console.log('🔄 FALLBACK: Utilisation API de secours pour les cartes');
      const response = await fetch('/api/stripe-payment-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ FALLBACK: Cartes bancaires chargées:', data?.paymentMethods?.length || 0);

      return data?.paymentMethods || [];
    } catch (fallbackError) {
      console.error('❌ FALLBACK: Erreur API de secours:', fallbackError);
      return []; // Return empty array instead of throwing
    }
  },

  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    console.log(`🗑️ SUPABASE: Suppression de la carte ${paymentMethodId}`);
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Utiliser la méthode POST avec action delete
      const { error } = await supabase.functions.invoke('stripe-payment-methods', {
        body: { 
          action: 'delete',
          paymentMethodId 
        }
      });
      
      if (error) {
        console.error('❌ SUPABASE: Erreur suppression carte:', error);
        throw error;
      }
      
      console.log('✅ SUPABASE: Carte supprimée de Stripe');
    } catch (error) {
      console.error('❌ SUPABASE: Erreur suppression carte:', error);
      throw error;
    }
  },

  async setDefaultPaymentMethod(userEmail: string, paymentMethodId: string): Promise<void> {
    console.log(`⭐ SUPABASE: Définition de la carte par défaut ${paymentMethodId} pour ${userEmail}`);
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Utiliser la méthode POST avec action set_default
      const { error } = await supabase.functions.invoke('stripe-payment-methods', {
        body: { 
          action: 'set_default',
          paymentMethodId 
        }
      });
      
      if (error) {
        console.error('❌ SUPABASE: Erreur définition carte par défaut:', error);
        throw error;
      }
      
      console.log('✅ SUPABASE: Carte par défaut mise à jour');
    } catch (error) {
      console.error('❌ SUPABASE: Erreur définition carte par défaut:', error);
      throw error;
    }
  }
};