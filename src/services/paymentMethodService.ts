
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
    const formattedPaymentMethods = paymentMethodsData.map((pm: any, index: number) => ({
      id: pm.id,
      type: pm.type,
      last4: pm.card?.last4 || '****',
      brand: pm.card?.brand || 'unknown',
      exp_month: pm.card?.exp_month || 0,
      exp_year: pm.card?.exp_year || 0,
      isDefault: index === 0, // La première carte est considérée comme par défaut pour l'instant
    }));
    
    return formattedPaymentMethods;
  },

  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    console.log(`🗑️ Suppression de la carte ${paymentMethodId}`);
    await stripeBackendService.detachPaymentMethod(paymentMethodId);
    console.log('✅ Carte supprimée de Stripe');
  },

  async setDefaultPaymentMethod(userEmail: string, paymentMethodId: string): Promise<void> {
    console.log(`⭐ Définition de la carte par défaut ${paymentMethodId} pour ${userEmail}`);
    
    // Récupérer le client Stripe
    const customer = await stripeBackendService.createOrGetCustomer(userEmail);
    
    // Mettre à jour la carte par défaut du client
    await stripeBackendService.setDefaultPaymentMethod(customer.id, paymentMethodId);
    
    console.log('✅ Carte par défaut mise à jour');
  }
};
