
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

  // Créer un Payment Link pour un affilié
  async createPaymentLink(amount: number, currency: string, affiliateEmail: string, campaignName: string) {
    console.log('💰 Création Payment Link:', { amount, currency, affiliateEmail });
    
    const formData = new URLSearchParams();
    formData.append('line_items[0][price_data][currency]', currency);
    formData.append('line_items[0][price_data][product_data][name]', `Commission - ${campaignName}`);
    formData.append('line_items[0][price_data][unit_amount]', (amount * 100).toString()); // Stripe utilise les centimes
    formData.append('line_items[0][quantity]', '1');
    formData.append('metadata[affiliate_email]', affiliateEmail);
    formData.append('metadata[campaign_name]', campaignName);
    formData.append('metadata[type]', 'affiliate_commission');

    const paymentLink = await this.callStripeAPI('/payment_links', {
      method: 'POST',
      body: formData,
    });

    console.log('✅ Payment Link créé:', paymentLink.url);
    return paymentLink;
  }
}

export const stripeBackendService = new StripeBackendService();
