
// Service complètement désactivé pour la production Stripe
// Toutes les opérations passent maintenant par les vraies API Vercel Edge Functions

// Stockage en mémoire des cartes supprimées pour éviter qu'elles réapparaissent
const deletedPaymentMethods = new Set<string>();

class StripeBackendService {
  private getStripeSecretKey(): string {
    // SÉCURITÉ: Ne jamais exposer la clé secrète Stripe côté frontend !
    throw new Error('Service désactivé - STRIPE_SECRET_KEY ne doit jamais être accessible côté frontend');
  }

  private async callStripeAPI(endpoint: string, options: RequestInit = {}) {
    throw new Error('Service désactivé - Les appels Stripe doivent passer par un backend sécurisé');
  }

  async createOrGetCustomer(email: string, name?: string) {
    console.log('⚠️ DÉSACTIVÉ: createOrGetCustomer - Utiliser les vraies API Vercel');
    throw new Error('Service désactivé - Utiliser les vraies API Vercel Edge Functions');
  }

  async createCheckoutSession(customerId: string, campaignName: string, campaignId: string) {
    console.log('⚠️ DÉSACTIVÉ: createCheckoutSession - Utiliser les vraies API Vercel');
    throw new Error('Service désactivé - Utiliser les vraies API Vercel Edge Functions');
  }

  async createSetupIntent(customerId: string, campaignName: string) {
    console.log('⚠️ DÉSACTIVÉ: createSetupIntent - Utiliser les vraies API Vercel');
    throw new Error('Service désactivé - Utiliser les vraies API Vercel Edge Functions');
  }

  async getSetupIntent(setupIntentId: string) {
    console.log('⚠️ DÉSACTIVÉ: getSetupIntent - Utiliser les vraies API Vercel');
    throw new Error('Service désactivé - Utiliser les vraies API Vercel Edge Functions');
  }

  async getCheckoutSession(sessionId: string) {
    console.log('⚠️ DÉSACTIVÉ: getCheckoutSession - Utiliser les vraies API Vercel');
    throw new Error('Service désactivé - Utiliser les vraies API Vercel Edge Functions');
  }

  async createPaymentLink(amount: number, currency: string, affiliateEmail: string, campaignName: string) {
    console.log('⚠️ DÉSACTIVÉ: createPaymentLink - Utiliser les vraies API Vercel');
    throw new Error('Service désactivé - Utiliser les vraies API Vercel Edge Functions');
  }

  async setDefaultPaymentMethod(customerId: string, paymentMethodId: string) {
    console.log('⚠️ DÉSACTIVÉ: setDefaultPaymentMethod - Utiliser les vraies API Vercel');
    throw new Error('Service désactivé - Utiliser les vraies API Vercel Edge Functions');
  }

  async getCustomerPaymentMethods(customerId: string) {
    console.log('⚠️ DÉSACTIVÉ: getCustomerPaymentMethods - Utiliser les vraies API Vercel');
    return [];
  }

  async detachPaymentMethod(paymentMethodId: string) {
    console.log('⚠️ DÉSACTIVÉ: detachPaymentMethod - Utiliser les vraies API Vercel');
    throw new Error('Service désactivé - Utiliser les vraies API Vercel Edge Functions');
  }
}

export const stripeBackendService = new StripeBackendService();
