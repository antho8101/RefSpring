
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
  stripePaymentMethodId?: string; // ID de la méthode de paiement Stripe associée
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
  // Nouveaux champs Stripe Connect
  stripeAccountId?: string;
  stripeAccountStatus?: 'pending' | 'verified' | 'incomplete';
}

export interface Conversion {
  id: string;
  affiliateId: string;
  campaignId: string;
  amount: number; // Montant de la vente
  commission: number; // Commission calculée
  timestamp: Date;
  verified: boolean;
  // Nouveaux champs pour la vérification
  status: 'pending' | 'verified' | 'rejected' | 'suspicious';
  verificationNotes?: string;
  verifiedBy?: string; // ID de l'admin qui a vérifié
  verifiedAt?: Date;
  riskScore?: number; // Score de 0 à 100
  webhookValidated?: boolean;
  auditTrail: ConversionAuditLog[];
}

export interface Click {
  id: string;
  affiliateId: string;
  campaignId: string;
  timestamp: Date;
  userAgent?: string;
  referrer?: string;
}

// Nouvelle interface pour les logs d'audit
export interface ConversionAuditLog {
  id: string;
  conversionId: string;
  action: 'created' | 'status_changed' | 'amount_updated' | 'verified' | 'rejected' | 'webhook_received';
  oldValue?: any;
  newValue?: any;
  performedBy: string; // 'system' ou ID de l'utilisateur
  timestamp: Date;
  notes?: string;
  metadata?: Record<string, any>;
}

// Interface pour la queue de vérification
export interface ConversionVerificationQueue {
  id: string;
  conversionId: string;
  campaignId: string;
  affiliateId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  assignedTo?: string; // ID de l'admin assigné
  createdAt: Date;
  processedAt?: Date;
  retryCount: number;
  nextRetryAt?: Date;
  metadata?: Record<string, any>;
}

// Interface pour les webhooks de validation
export interface ConversionWebhook {
  id: string;
  conversionId: string;
  webhookUrl: string;
  status: 'pending' | 'sent' | 'success' | 'failed' | 'timeout';
  responseCode?: number;
  responseBody?: string;
  sentAt?: Date;
  receivedAt?: Date;
  retryCount: number;
  maxRetries: number;
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
