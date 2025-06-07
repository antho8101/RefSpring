// Clés Stripe test - vos vraies clés
export const STRIPE_PUBLIC_KEY = 'pk_test_51RWK0X4bg54RW2vEox1ilBvJP7snu2jCKn0DGCkvnHPc8nlegKUftmWBwUvWf1jPlbOYYv3KANwQ2BwjeEbeBZ6M00MX8WGMuZ';
export const STRIPE_SECRET_KEY = 'sk_test_51RWK0X4bg54RW2vEGdcZGBE6JDmCI8Zd2cWSEb7M0q8DLFoU1W4qgRgfJsrH7BqSAeKbQcAKXELfkpQk4zFlQJ5b00GxsK33ov';

export interface CreatePaymentSetupRequest {
  campaignId: string;
  campaignName: string;
  userEmail: string;
}

export interface CreatePaymentSetupResponse {
  setupIntentId: string;
  stripeCustomerId: string;
  checkoutUrl: string;
}

// Variable pour activer/désactiver la simulation (maintenant désactivée)
const USE_SIMULATION = false;

// Fonction pour créer un SetupIntent Stripe
export const createPaymentSetup = async (data: CreatePaymentSetupRequest): Promise<CreatePaymentSetupResponse> => {
  if (USE_SIMULATION) {
    // Code de simulation existant gardé pour référence
    console.log('🧪 SIMULATION: Création du setup de paiement pour', data.campaignName);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const setupIntentId = `seti_sim_${Date.now()}`;
    const customerId = `cus_sim_${Date.now()}`;
    const simulationUrl = `${window.location.origin}/payment-success?setup_intent=${setupIntentId}&campaign_id=${data.campaignId}&simulation=true`;
    return {
      setupIntentId,
      stripeCustomerId: customerId,
      checkoutUrl: simulationUrl,
    };
  }

  // Implémentation réelle avec vos clés Stripe test
  console.log('🔄 Création réelle du setup de paiement pour:', data.campaignName);
  
  try {
    // Appel à notre nouvelle fonction backend
    const response = await fetch('/api/stripe/create-setup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Setup de paiement créé:', result);
    return result;
  } catch (error) {
    console.error('❌ Erreur création setup:', error);
    throw new Error('Erreur lors de la création du setup de paiement');
  }
};

// Fonction pour vérifier le statut d'un SetupIntent
export const checkPaymentSetupStatus = async (setupIntentId: string): Promise<{ status: string; paymentMethod?: string }> => {
  if (USE_SIMULATION) {
    console.log('🧪 SIMULATION: Vérification du statut pour', setupIntentId);
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      status: 'succeeded',
      paymentMethod: 'pm_simulation_123',
    };
  }

  // Implémentation réelle
  try {
    const response = await fetch(`/api/stripe/check-setup/${setupIntentId}`);
    
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${await response.text()}`);
    }

    return response.json();
  } catch (error) {
    console.error('❌ Erreur vérification statut:', error);
    throw new Error('Erreur lors de la vérification du statut');
  }
};

// Fonction pour calculer les commissions mensuelles
export const calculateMonthlyCommissions = (conversions: any[], period: string): number => {
  const periodStart = new Date(period + '-01');
  const periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0);
  
  return conversions
    .filter(conv => {
      const convDate = conv.timestamp.toDate ? conv.timestamp.toDate() : new Date(conv.timestamp);
      return convDate >= periodStart && convDate <= periodEnd;
    })
    .reduce((total, conv) => total + (conv.amount || 0), 0);
};

// Fonction pour calculer les frais (2.5% du CA)
export const calculateFees = (revenue: number): number => {
  if (revenue < 20) return 0;
  return revenue * 0.025;
};
