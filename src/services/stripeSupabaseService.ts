import { supabase } from '@/integrations/supabase/client';

class StripeSupabaseService {
  
  async createSetupIntent(userEmail: string, campaignName: string, campaignId?: string) {
    console.log('💳 STRIPE SUPABASE - Création Setup Intent');
    
    try {
      const { data, error } = await supabase.functions.invoke('stripe-setup-intent', {
        body: {
          userEmail,
          campaignName,
          campaignId
        }
      });

      if (error) {
        console.error('❌ STRIPE SUPABASE - Erreur Setup Intent:', error);
        throw new Error(error.message || 'Erreur lors de la création du Setup Intent');
      }

      console.log('✅ STRIPE SUPABASE - Setup Intent créé:', data.setupIntentId);
      return {
        clientSecret: data.clientSecret,
        customerId: data.customerId,
        setupIntentId: data.setupIntentId
      };

    } catch (error) {
      console.error('❌ STRIPE SUPABASE - Erreur:', error);
      throw error;
    }
  }

  async getPaymentMethods(userEmail?: string) {
    console.log('💳 STRIPE SUPABASE - Récupération méthodes de paiement');
    
    try {
      const { data, error } = await supabase.functions.invoke('stripe-payment-methods', {
        method: 'GET'
      });

      if (error) {
        console.error('❌ STRIPE SUPABASE - Erreur payment methods:', error);
        throw new Error(error.message || 'Erreur lors de la récupération des méthodes de paiement');
      }

      console.log('✅ STRIPE SUPABASE - Méthodes trouvées:', data.paymentMethods?.length || 0);
      return data.paymentMethods || [];

    } catch (error) {
      console.error('❌ STRIPE SUPABASE - Erreur:', error);
      return [];
    }
  }

  async setDefaultPaymentMethod(customerId: string, paymentMethodId: string) {
    console.log('💳 STRIPE SUPABASE - Définition méthode par défaut');
    
    try {
      const { data, error } = await supabase.functions.invoke('stripe-payment-methods', {
        method: 'POST',
        body: {
          action: 'set_default',
          customerId,
          paymentMethodId
        }
      });

      if (error) {
        console.error('❌ STRIPE SUPABASE - Erreur set default:', error);
        throw new Error(error.message || 'Erreur lors de la définition de la méthode par défaut');
      }

      console.log('✅ STRIPE SUPABASE - Méthode définie par défaut');
      return data.success;

    } catch (error) {
      console.error('❌ STRIPE SUPABASE - Erreur:', error);
      throw error;
    }
  }

  async attachPaymentMethod(customerId: string, paymentMethodId: string) {
    console.log('💳 STRIPE SUPABASE - Attachement méthode de paiement');
    
    try {
      const { data, error } = await supabase.functions.invoke('stripe-payment-methods', {
        method: 'POST',
        body: {
          action: 'attach',
          customerId,
          paymentMethodId
        }
      });

      if (error) {
        console.error('❌ STRIPE SUPABASE - Erreur attach:', error);
        throw new Error(error.message || 'Erreur lors de l\'attachement de la méthode');
      }

      console.log('✅ STRIPE SUPABASE - Méthode attachée');
      return data.success;

    } catch (error) {
      console.error('❌ STRIPE SUPABASE - Erreur:', error);
      throw error;
    }
  }

  async detachPaymentMethod(paymentMethodId: string) {
    console.log('💳 STRIPE SUPABASE - Suppression méthode de paiement');
    
    try {
      const { data, error } = await supabase.functions.invoke('stripe-payment-methods', {
        method: 'DELETE',
        body: {
          paymentMethodId
        }
      });

      if (error) {
        console.error('❌ STRIPE SUPABASE - Erreur détach:', error);
        throw new Error(error.message || 'Erreur lors de la suppression de la méthode');
      }

      console.log('✅ STRIPE SUPABASE - Méthode supprimée');
      return data.success;

    } catch (error) {
      console.error('❌ STRIPE SUPABASE - Erreur:', error);
      throw error;
    }
  }

  // Legacy methods for backward compatibility
  async createOrGetCustomer(email: string, name?: string) {
    console.log('💳 STRIPE SUPABASE - Creating or getting customer (legacy method)');
    // This is now handled internally by the setup intent function
    return { id: 'handled-by-setup-intent' };
  }

  async getCustomerPaymentMethods(customerId: string) {
    return this.getPaymentMethods();
  }

  async createCheckoutSession(customerId: string, campaignName: string, campaignId: string) {
    console.log('❌ STRIPE SUPABASE - createCheckoutSession not implemented');
    throw new Error('Checkout sessions not implemented - use setup intents instead');
  }

  async getSetupIntent(setupIntentId: string) {
    console.log('❌ STRIPE SUPABASE - getSetupIntent not implemented');
    throw new Error('Direct setup intent retrieval not implemented');
  }

  async getCheckoutSession(sessionId: string) {
    console.log('❌ STRIPE SUPABASE - getCheckoutSession not implemented');
    throw new Error('Checkout session retrieval not implemented');
  }

  async createPaymentLink(amount: number, currency: string, affiliateEmail: string, campaignName: string) {
    console.log('❌ STRIPE SUPABASE - createPaymentLink not implemented');
    throw new Error('Payment links not implemented yet');
  }
}

export const stripeSupabaseService = new StripeSupabaseService();