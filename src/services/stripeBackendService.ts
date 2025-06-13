
// Service temporairement en mode simulation pour éviter l'accès dangereux à STRIPE_SECRET_KEY côté frontend
// Ce service sera remplacé par de vraies API routes backend sécurisées

// Stockage en mémoire des cartes supprimées pour éviter qu'elles réapparaissent
const deletedPaymentMethods = new Set<string>();

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
    console.log('🧪 SIMULATION: createOrGetCustomer pour', email);
    // Retourner un objet simulé au lieu d'une erreur
    return {
      id: `cus_sim_${Date.now()}`,
      email: email,
      name: name || 'Utilisateur Simulé'
    };
  }

  async createCheckoutSession(customerId: string, campaignName: string, campaignId: string) {
    console.log('🧪 SIMULATION: createCheckoutSession pour', campaignName);
    // Retourner un objet simulé
    return {
      id: `cs_sim_${Date.now()}`,
      url: `${window.location.origin}/payment-success?setup_intent=seti_sim_${Date.now()}&campaign_id=${campaignId}&simulation=true`,
      customer: customerId
    };
  }

  async createSetupIntent(customerId: string, campaignName: string) {
    console.log('🧪 SIMULATION: createSetupIntent pour', campaignName);
    return {
      id: `seti_sim_${Date.now()}`,
      status: 'requires_payment_method',
      client_secret: `seti_sim_${Date.now()}_secret`
    };
  }

  async getSetupIntent(setupIntentId: string) {
    console.log('🧪 SIMULATION: getSetupIntent pour', setupIntentId);
    return {
      id: setupIntentId,
      status: 'succeeded',
      payment_method: `pm_sim_${Date.now()}`
    };
  }

  async getCheckoutSession(sessionId: string) {
    console.log('🧪 SIMULATION: getCheckoutSession pour', sessionId);
    return {
      id: sessionId,
      status: 'complete',
      setup_intent: `seti_sim_${Date.now()}`,
      customer: `cus_sim_${Date.now()}`
    };
  }

  async createPaymentLink(amount: number, currency: string, affiliateEmail: string, campaignName: string) {
    console.log('🧪 SIMULATION: createPaymentLink pour', affiliateEmail);
    return {
      id: `plink_sim_${Date.now()}`,
      url: `https://buy.stripe.com/simulation/${Date.now()}`,
      active: true
    };
  }

  async setDefaultPaymentMethod(customerId: string, paymentMethodId: string) {
    console.log('🧪 SIMULATION: setDefaultPaymentMethod', paymentMethodId, 'pour', customerId);
    return {
      id: customerId,
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    };
  }

  async getCustomerPaymentMethods(customerId: string) {
    console.log('🧪 SIMULATION: getCustomerPaymentMethods pour', customerId);
    
    // Vérifier si on a des cartes supprimées pour ce client
    const userKey = `user_${customerId}`;
    const deletedForUser = Array.from(deletedPaymentMethods).filter(id => id.includes(userKey));
    
    // Si l'utilisateur a supprimé sa carte, ne pas en retourner de nouvelle
    if (deletedForUser.length > 0) {
      console.log('🧪 SIMULATION: Aucune carte retournée (utilisateur a supprimé sa carte)');
      return [];
    }
    
    // Sinon, retourner une carte simulée
    return [
      {
        id: `pm_sim_${Date.now()}`,
        type: 'card',
        card: {
          last4: '4242',
          brand: 'visa',
          exp_month: 12,
          exp_year: 2028
        },
        created: Date.now() / 1000
      }
    ];
  }

  async detachPaymentMethod(paymentMethodId: string) {
    console.log('🧪 SIMULATION: detachPaymentMethod', paymentMethodId);
    
    // Ajouter cette carte à la liste des cartes supprimées
    // On utilise un pattern pour identifier l'utilisateur
    const userKey = `user_${Date.now()}`;
    deletedPaymentMethods.add(`${userKey}_${paymentMethodId}`);
    
    console.log('🧪 SIMULATION: Carte marquée comme supprimée définitivement');
    
    return {
      id: paymentMethodId,
      object: 'payment_method'
    };
  }
}

export const stripeBackendService = new StripeBackendService();
