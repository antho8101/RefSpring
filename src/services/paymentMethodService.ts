
import { stripeBackendService } from '@/services/stripeBackendService';

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
    console.log('🔍 Chargement des cartes bancaires pour:', userEmail);
    
    // 1. Récupérer le client Stripe
    const customer = await stripeBackendService.createOrGetCustomer(userEmail);
    console.log('✅ Client Stripe trouvé:', customer.id);
    
    // 2. Récupérer les méthodes de paiement du client
    const paymentMethodsData = await stripeBackendService.getCustomerPaymentMethods(customer.id);
    console.log('💳 Méthodes de paiement trouvées:', paymentMethodsData.length);
    
    // 3. Formater les données
    const formattedPaymentMethods = paymentMethodsData.map((pm: any) => ({
      id: pm.id,
      type: pm.type,
      last4: pm.card?.last4 || '****',
      brand: pm.card?.brand || 'unknown',
      exp_month: pm.card?.exp_month || 0,
      exp_year: pm.card?.exp_year || 0,
      isDefault: false,
    }));
    
    return formattedPaymentMethods;
  },

  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    console.log(`🗑️ Suppression de la carte ${paymentMethodId}`);
    await stripeBackendService.detachPaymentMethod(paymentMethodId);
    console.log('✅ Carte supprimée de Stripe');
  }
};
