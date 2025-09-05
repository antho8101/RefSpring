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
      // Utiliser Supabase Edge Function au lieu de l'ancienne API
      const { supabase } = await import('@/integrations/supabase/client');
      
      const { data, error } = await supabase.functions.invoke('stripe-payment-methods', {
        body: { userEmail }
      });
      
      if (error) {
        console.error('❌ SUPABASE: Erreur récupération méthodes de paiement:', error);
        return [];
      }
      
      console.log('✅ SUPABASE: Cartes bancaires chargées:', data?.paymentMethods?.length || 0);
      return data?.paymentMethods || [];
    } catch (error) {
      console.error('❌ SUPABASE: Erreur chargement cartes:', error);
      return [];
    }
  },

  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    console.log(`🗑️ SUPABASE: Suppression de la carte ${paymentMethodId}`);
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
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
      
      const { error } = await supabase.functions.invoke('stripe-payment-methods', {
        body: { 
          action: 'setDefault',
          userEmail, 
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