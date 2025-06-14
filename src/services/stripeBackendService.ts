
// Service complètement désactivé pour la production Stripe
// Toutes les opérations passent maintenant par les vraies API Vercel Edge Functions

class StripeBackendService {
  async createOrGetCustomer(email: string, name?: string) {
    console.log('❌ SERVICE DÉSACTIVÉ: StripeBackendService.createOrGetCustomer');
    throw new Error('Service désactivé - Utiliser les vraies API Vercel Edge Functions');
  }

  async createCheckoutSession(customerId: string, campaignName: string, campaignId: string) {
    console.log('❌ SERVICE DÉSACTIVÉ: StripeBackendService.createCheckoutSession');
    throw new Error('Service désactivé - Utiliser les vraies API Vercel Edge Functions');
  }

  async createSetupIntent(customerId: string, campaignName: string) {
    console.log('❌ SERVICE DÉSACTIVÉ: StripeBackendService.createSetupIntent');
    throw new Error('Service désactivé - Utiliser les vraies API Vercel Edge Functions');
  }

  async getSetupIntent(setupIntentId: string) {
    console.log('❌ SERVICE DÉSACTIVÉ: StripeBackendService.getSetupIntent');
    throw new Error('Service désactivé - Utiliser les vraies API Vercel Edge Functions');
  }

  async getCheckoutSession(sessionId: string) {
    console.log('❌ SERVICE DÉSACTIVÉ: StripeBackendService.getCheckoutSession');
    throw new Error('Service désactivé - Utiliser les vraies API Vercel Edge Functions');
  }

  async createPaymentLink(amount: number, currency: string, affiliateEmail: string, campaignName: string) {
    console.log('❌ SERVICE DÉSACTIVÉ: StripeBackendService.createPaymentLink');
    throw new Error('Service désactivé - Utiliser les vraies API Vercel Edge Functions');
  }

  async setDefaultPaymentMethod(customerId: string, paymentMethodId: string) {
    console.log('❌ SERVICE DÉSACTIVÉ: StripeBackendService.setDefaultPaymentMethod');
    throw new Error('Service désactivé - Utiliser les vraies API Vercel Edge Functions');
  }

  async getCustomerPaymentMethods(customerId: string) {
    console.log('❌ SERVICE DÉSACTIVÉ: StripeBackendService.getCustomerPaymentMethods');
    return [];
  }

  async detachPaymentMethod(paymentMethodId: string) {
    console.log('❌ SERVICE DÉSACTIVÉ: StripeBackendService.detachPaymentMethod');
    throw new Error('Service désactivé - Utiliser les vraies API Vercel Edge Functions');
  }
}

export const stripeBackendService = new StripeBackendService();
