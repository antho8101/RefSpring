
// Service temporairement désactivé pour éviter l'accès dangereux à STRIPE_SECRET_KEY côté frontend
// Ce service sera remplacé par de vraies API routes backend sécurisées

class StripeBackendService {
  private getStripeSecretKey(): string {
    // SÉCURITÉ: Ne jamais exposer la clé secrète Stripe côté frontend !
    // Cette méthode est temporairement désactivée
    throw new Error('Service désactivé - STRIPE_SECRET_KEY ne doit jamais être accessible côté frontend');
  }

  private async callStripeAPI(endpoint: string, options: RequestInit = {}) {
    throw new Error('Service désactivé - Les appels Stripe doivent passer par un backend sécurisé');
  }

  async createOrGetCustomer(email: string, name?: string) {
    throw new Error('Service désactivé - Utilisez une API backend sécurisée');
  }

  async createCheckoutSession(customerId: string, campaignName: string, campaignId: string) {
    throw new Error('Service désactivé - Utilisez une API backend sécurisée');
  }

  async createSetupIntent(customerId: string, campaignName: string) {
    throw new Error('Service désactivé - Utilisez une API backend sécurisée');
  }

  async getSetupIntent(setupIntentId: string) {
    throw new Error('Service désactivé - Utilisez une API backend sécurisée');
  }

  async getCheckoutSession(sessionId: string) {
    throw new Error('Service désactivé - Utilisez une API backend sécurisée');
  }

  async createPaymentLink(amount: number, currency: string, affiliateEmail: string, campaignName: string) {
    throw new Error('Service désactivé - Utilisez une API backend sécurisée');
  }

  async setDefaultPaymentMethod(customerId: string, paymentMethodId: string) {
    throw new Error('Service désactivé - Utilisez une API backend sécurisée');
  }

  async getCustomerPaymentMethods(customerId: string) {
    throw new Error('Service désactivé - Utilisez une API backend sécurisée');
  }

  async detachPaymentMethod(paymentMethodId: string) {
    throw new Error('Service désactivé - Utilisez une API backend sécurisée');
  }
}

export const stripeBackendService = new StripeBackendService();
