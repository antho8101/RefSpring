
// Clés Stripe en dur pour le développement (environnement test)
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

// Variable pour activer/désactiver la simulation (mettre à false quand Firebase Functions sera prêt)
const USE_SIMULATION = true;

// Fonction pour créer un SetupIntent Stripe (sera appelée via HTTP)
export const createPaymentSetup = async (data: CreatePaymentSetupRequest): Promise<CreatePaymentSetupResponse> => {
  if (USE_SIMULATION) {
    console.log('🧪 SIMULATION: Création du setup de paiement pour', data.campaignName);
    
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Générer des IDs temporaires
    const setupIntentId = `seti_sim_${Date.now()}`;
    const customerId = `cus_sim_${Date.now()}`;
    
    // Construire l'URL de simulation
    const simulationUrl = `${window.location.origin}/payment-success?setup_intent=${setupIntentId}&campaign_id=${data.campaignId}&simulation=true`;
    
    console.log('🧪 SIMULATION: Redirection vers', simulationUrl);
    
    return {
      setupIntentId,
      stripeCustomerId: customerId,
      checkoutUrl: simulationUrl,
    };
  }

  // Code original pour les vraies Firebase Functions
  const response = await fetch('/api/createPaymentSetup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la création du setup de paiement');
  }

  return response.json();
};

// Fonction pour vérifier le statut d'un SetupIntent
export const checkPaymentSetupStatus = async (setupIntentId: string): Promise<{ status: string; paymentMethod?: string }> => {
  if (USE_SIMULATION) {
    console.log('🧪 SIMULATION: Vérification du statut pour', setupIntentId);
    
    // Simuler un délai
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simuler un succès
    return {
      status: 'succeeded',
      paymentMethod: 'pm_simulation_123',
    };
  }

  // Code original pour les vraies Firebase Functions
  const response = await fetch(`/api/checkPaymentSetup/${setupIntentId}`);
  
  if (!response.ok) {
    throw new Error('Erreur lors de la vérification du statut');
  }

  return response.json();
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
  if (revenue < 20) return 0; // Pas de frais si moins de 20€
  return revenue * 0.025; // 2.5% du CA
};
