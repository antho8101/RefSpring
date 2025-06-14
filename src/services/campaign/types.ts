
// Simplified interface for the payment methods view
export interface CampaignSummary {
  id: string;
  name: string;
  isActive: boolean;
  paymentMethodId?: string;
}
