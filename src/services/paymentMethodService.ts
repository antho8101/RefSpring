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
    console.log('🔍 SUPABASE V2: Chargement des cartes bancaires pour:', userEmail);
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Utiliser la nouvelle fonction V2 pour forcer un déploiement propre
      const { data, error } = await supabase.functions.invoke('stripe-payment-methods-v2', {
        body: {} // POST vide pour déclencher handleGetPaymentMethods
      });
      
      if (error) {
        console.error('❌ SUPABASE V2: Erreur récupération méthodes de paiement:', error);
        return [];
      }
      
      console.log('✅ SUPABASE V2: Cartes bancaires chargées:', data?.paymentMethods?.length || 0);
      console.log('📋 SUPABASE V2: Version de fonction:', data?.function_version || 'unknown');
      
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
    } catch (error) {
      console.error('❌ SUPABASE V2: Erreur chargement cartes:', error);
      return [];
    }
  },

  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    console.log(`🗑️ SUPABASE V2: Suppression de la carte ${paymentMethodId}`);
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Utiliser la nouvelle fonction V2 avec action delete
      const { error } = await supabase.functions.invoke('stripe-payment-methods-v2', {
        body: { 
          action: 'delete',
          paymentMethodId 
        }
      });
      
      if (error) {
        console.error('❌ SUPABASE V2: Erreur suppression carte:', error);
        throw error;
      }
      
      console.log('✅ SUPABASE V2: Carte supprimée de Stripe');
    } catch (error) {
      console.error('❌ SUPABASE V2: Erreur suppression carte:', error);
      throw error;
    }
  },

  async setDefaultPaymentMethod(userEmail: string, paymentMethodId: string): Promise<void> {
    console.log(`⭐ SUPABASE V2: Définition de la carte par défaut ${paymentMethodId} pour ${userEmail}`);
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Utiliser la nouvelle fonction V2 avec action set_default
      const { error } = await supabase.functions.invoke('stripe-payment-methods-v2', {
        body: { 
          action: 'set_default',
          paymentMethodId 
        }
      });
      
      if (error) {
        console.error('❌ SUPABASE V2: Erreur définition carte par défaut:', error);
        throw error;
      }
      
      console.log('✅ SUPABASE V2: Carte par défaut mise à jour');
    } catch (error) {
      console.error('❌ SUPABASE V2: Erreur définition carte par défaut:', error);
      throw error;
    }
  }
};