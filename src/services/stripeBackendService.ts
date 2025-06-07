
import { STRIPE_SECRET_KEY } from '@/utils/stripeUtils';

// Service pour gérer les appels backend Stripe
class StripeBackendService {
  private async callStripeAPI(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`https://api.stripe.com/v1${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Stripe API Error: ${error}`);
    }

    return response.json();
  }

  // Créer ou récupérer un client Stripe
  async createOrGetCustomer(email: string, name?: string) {
    console.log('🔍 Recherche client Stripe pour:', email);
    
    // Chercher un client existant
    const searchParams = new URLSearchParams();
    searchParams.append('email', email);
    searchParams.append('limit', '1');
    
    const existingCustomers = await this.callStripeAPI(`/customers?${searchParams.toString()}`);
    
    if (existingCustomers.data.length > 0) {
      console.log('✅ Client existant trouvé:', existingCustomers.data[0].id);
      return existingCustomers.data[0];
    }

    // Créer un nouveau client
    console.log('🆕 Création nouveau client Stripe');
    const formData = new URLSearchParams();
    formData.append('email', email);
    if (name) formData.append('name', name);

    const customer = await this.callStripeAPI('/customers', {
      method: 'POST',
      body: formData,
    });

    console.log('✅ Nouveau client créé:', customer.id);
    return customer;
  }

  // Créer une session de checkout pour la configuration de paiement
  async createCheckoutSession(customerId: string, campaignName: string, campaignId: string) {
    console.log('🔄 Création session checkout pour client:', customerId);
    
    const formData = new URLSearchParams();
    formData.append('customer', customerId);
    formData.append('mode', 'setup');
    formData.append('currency', 'eur'); // Obligatoire pour les sessions setup
    formData.append('success_url', `${window.location.origin}/payment-success?setup_intent={CHECKOUT_SESSION_ID}&campaign_id=${campaignId}`);
    formData.append('cancel_url', `${window.location.origin}/dashboard`);
    formData.append('metadata[campaign_name]', campaignName);
    formData.append('metadata[campaign_id]', campaignId);

    const session = await this.callStripeAPI('/checkout/sessions', {
      method: 'POST',
      body: formData,
    });

    console.log('✅ Session checkout créée:', session.id);
    return session;
  }

  // Créer un SetupIntent pour configurer un moyen de paiement
  async createSetupIntent(customerId: string, campaignName: string) {
    console.log('🔄 Création SetupIntent pour client:', customerId);
    
    const formData = new URLSearchParams();
    formData.append('customer', customerId);
    formData.append('usage', 'off_session');
    formData.append('metadata[campaign_name]', campaignName);

    const setupIntent = await this.callStripeAPI('/setup_intents', {
      method: 'POST',
      body: formData,
    });

    console.log('✅ SetupIntent créé:', setupIntent.id);
    return setupIntent;
  }

  // Récupérer le statut d'un SetupIntent
  async getSetupIntent(setupIntentId: string) {
    console.log('🔍 Récupération SetupIntent:', setupIntentId);
    return this.callStripeAPI(`/setup_intents/${setupIntentId}`);
  }

  // Récupérer une session de checkout
  async getCheckoutSession(sessionId: string) {
    console.log('🔍 Récupération session checkout:', sessionId);
    return this.callStripeAPI(`/checkout/sessions/${sessionId}`);
  }

  // Créer un Payment Link pour un affilié (CORRIGÉ pour éviter les erreurs de précision)
  async createPaymentLink(amount: number, currency: string, affiliateEmail: string, campaignName: string) {
    console.log('💰 Création Payment Link:', { amount, currency, affiliateEmail });
    
    // D'abord, créer un produit
    const productData = new URLSearchParams();
    productData.append('name', `Commission - ${campaignName}`);
    productData.append('type', 'service');

    const product = await this.callStripeAPI('/products', {
      method: 'POST',
      body: productData,
    });

    console.log('✅ Produit créé:', product.id);

    // CORRECTION : Calculer le montant en centimes avec Math.round pour éviter les erreurs de précision
    const unitAmountInCents = Math.round(amount * 100);
    console.log('💰 Montant original:', amount, '€, en centimes:', unitAmountInCents);

    // Ensuite, créer un prix pour ce produit
    const priceData = new URLSearchParams();
    priceData.append('currency', currency);
    priceData.append('product', product.id);
    priceData.append('unit_amount', unitAmountInCents.toString()); // Utiliser Math.round et toString()

    const price = await this.callStripeAPI('/prices', {
      method: 'POST',
      body: priceData,
    });

    console.log('✅ Prix créé:', price.id);

    // Enfin, créer le Payment Link avec le prix
    const paymentLinkData = new URLSearchParams();
    paymentLinkData.append('line_items[0][price]', price.id);
    paymentLinkData.append('line_items[0][quantity]', '1');
    paymentLinkData.append('metadata[affiliate_email]', affiliateEmail);
    paymentLinkData.append('metadata[campaign_name]', campaignName);
    paymentLinkData.append('metadata[type]', 'affiliate_commission');

    const paymentLink = await this.callStripeAPI('/payment_links', {
      method: 'POST',
      body: paymentLinkData,
    });

    console.log('✅ Payment Link créé:', paymentLink.url);
    return paymentLink;
  }
}

export const stripeBackendService = new StripeBackendService();
