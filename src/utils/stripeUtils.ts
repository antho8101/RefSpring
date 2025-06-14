
// Configuration Stripe sécurisée via variables d'environnement
export const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';

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

// Fonction pour créer un SetupIntent Stripe (PRODUCTION UNIQUEMENT)
export const createPaymentSetup = async (data: CreatePaymentSetupRequest): Promise<CreatePaymentSetupResponse> => {
  console.log('🔄 PRODUCTION: Création réelle du setup de paiement pour:', data.campaignName);
  
  try {
    // Utilisation des vraies API Vercel Edge Functions
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
    console.log('✅ PRODUCTION: Setup de paiement créé:', result);
    return result;
  } catch (error) {
    console.error('❌ PRODUCTION: Erreur création setup:', error);
    throw new Error('Erreur lors de la création du setup de paiement');
  }
};

// Fonction pour vérifier le statut d'un SetupIntent (PRODUCTION UNIQUEMENT)
export const checkPaymentSetupStatus = async (setupIntentId: string): Promise<{ status: string; paymentMethod?: string }> => {
  console.log('🔄 PRODUCTION: Vérification réelle du statut pour:', setupIntentId);
  
  try {
    const response = await fetch(`/api/stripe/check-setup?setupIntentId=${encodeURIComponent(setupIntentId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ PRODUCTION: Statut vérifié:', result);
    return result;
  } catch (error) {
    console.error('❌ PRODUCTION: Erreur vérification statut:', error);
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
