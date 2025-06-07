
export interface Campaign {
  id: string;
  name: string;
  description: string;
  targetUrl: string;
  trackingScript?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  isActive: boolean;
  defaultCommissionRate: number; // Taux de commission par défaut en pourcentage
  // Nouveaux champs Stripe
  stripeCustomerId?: string;
  stripeSetupIntentId?: string;
  paymentConfigured: boolean;
  isDraft: boolean; // Pour gérer l'état avant validation Stripe
}

export interface Affiliate {
  id: string;
  name: string;
  email: string;
  commissionRate: number; // Pourcentage (ex: 10 pour 10%)
  campaignId: string;
  userId: string;
  trackingCode: string;
  createdAt: Date;
  isActive: boolean;
}

export interface Conversion {
  id: string;
  affiliateId: string;
  campaignId: string;
  amount: number; // Montant de la vente
  commission: number; // Commission calculée
  timestamp: Date;
  verified: boolean;
}

export interface Click {
  id: string;
  affiliateId: string;
  campaignId: string;
  timestamp: Date;
  userAgent?: string;
  referrer?: string;
}

// Nouvelles interfaces pour la facturation
export interface BillingRecord {
  id: string;
  userId: string;
  campaignId: string;
  period: string; // YYYY-MM format
  totalRevenue: number;
  commissionAmount: number;
  feeAmount: number; // 2.5% du CA
  status: 'pending' | 'paid' | 'failed';
  stripeChargeId?: string;
  createdAt: Date;
  processedAt?: Date;
}

// Nouvelles interfaces pour la distribution de paiements
export interface PaymentDistribution {
  id: string;
  campaignId: string;
  userId: string;
  reason: 'campaign_deletion' | 'monthly_payment';
  totalRevenue: number;
  totalCommissions: number;
  platformFee: number;
  affiliatePayments: {
    affiliateId: string;
    affiliateName: string;
    affiliateEmail: string;
    totalCommission: number;
    conversionsCount: number;
  }[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  processedAt?: Date;
  stripePaymentLinks?: string[];
}
