
import { Timestamp } from 'firebase/firestore';

export interface CommissionData {
  campaignId: string;
  affiliateId: string;
  amount: number;
  commission: number;
  timestamp: Date;
}

export interface AffiliatePayment {
  affiliateId: string;
  affiliateName: string;
  affiliateEmail: string;
  totalCommission: number;
  conversionsCount: number;
  commissionRate: number;
  // Nouveau champ Stripe Connect
  stripeAccountId?: string;
}

export interface PaymentDistribution {
  totalRevenue: number;
  totalCommissions: number;
  platformFee: number;
  affiliatePayments: AffiliatePayment[];
}

export interface LastPaymentInfo {
  hasPayments: boolean;
  lastPaymentDate: Date | null;
}

export interface AffiliateData {
  id: string;
  name: string;
  email: string;
  commissionRate: number;
  campaignId: string;
  stripeAccountId?: string; // 🆕 STRIPE CONNECT
}

export interface ConversionData {
  id: string;
  affiliateId: string;
  campaignId: string;
  amount: number;
  commission: number;
  createdAt: Timestamp;
  convertedDate: Date;
}
