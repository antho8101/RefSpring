
// Re-export all types and functions for backward compatibility
export type { 
  CommissionData, 
  AffiliatePayment, 
  PaymentDistribution, 
  LastPaymentInfo 
} from './commission/types';

export { calculateCommissionsSinceDate } from './commission/calculationService';
export { getLastPaymentInfo, createPaymentDistributionRecord } from './commission/paymentService';
export { sendStripePaymentLinks } from './commission/emailService';
