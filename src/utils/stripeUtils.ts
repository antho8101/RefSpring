
import { functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';

// Configuration Stripe sécurisée via variables d'environnement
export const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || '';

export interface CreatePaymentSetupRequest {
  campaignId: string;
  campaignName: string;
  userEmail: string;
}

export interface CreatePaymentSetupResponse {
  setupIntentId: string;
  checkoutUrl: string;
  clientSecret: string;
}

// Fonction pour créer un SetupIntent Stripe via Firebase
export const createPaymentSetup = async (data: CreatePaymentSetupRequest): Promise<CreatePaymentSetupResponse> => {
  console.log('🔄 FIREBASE: Création réelle du setup de paiement pour:', data.campaignName);
  
  try {
    const createSetup = httpsCallable(functions, 'stripeCreateSetup');
    const result = await createSetup(data);
    const setupData = result.data as CreatePaymentSetupResponse;
    
    console.log('✅ FIREBASE: Setup de paiement créé:', setupData.setupIntentId);
    return setupData;
  } catch (error: any) {
    console.error('❌ FIREBASE: Erreur création setup:', error);
    throw new Error(`Erreur lors de la création du setup: ${error.message}`);
  }
};

// Fonction pour vérifier le statut d'un SetupIntent via Firebase
export const checkPaymentSetupStatus = async (setupIntentId: string): Promise<{ status: string; paymentMethod?: string }> => {
  console.log('🔄 FIREBASE: Vérification réelle du statut pour:', setupIntentId);
  
  try {
    const checkSetup = httpsCallable(functions, 'stripeCheckSetup');
    const result = await checkSetup({ setupIntentId });
    const data = result.data as any;
    
    console.log('✅ FIREBASE: Statut vérifié:', data.success ? 'success' : 'failed');
    
    return {
      status: data.success ? 'succeeded' : 'failed',
      paymentMethod: data.paymentMethodId,
    };
  } catch (error: any) {
    console.error('❌ FIREBASE: Erreur vérification statut:', error);
    throw new Error(`Erreur lors de la vérification: ${error.message}`);
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
