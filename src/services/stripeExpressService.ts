
import { EmailService } from './emailService';

// Service désactivé - Toutes les opérations passent par les vraies API Vercel Edge Functions
export class StripeExpressService {
  async handleCreateSetup(data: { campaignId: string; campaignName: string; userEmail: string }) {
    console.log('❌ SERVICE DÉSACTIVÉ: StripeExpressService.handleCreateSetup');
    throw new Error('Service désactivé - Utiliser les vraies API Vercel Edge Functions');
  }

  async handleCheckSetup(setupIntentId: string) {
    console.log('❌ SERVICE DÉSACTIVÉ: StripeExpressService.handleCheckSetup');
    throw new Error('Service désactivé - Utiliser les vraies API Vercel Edge Functions');
  }

  async sendPaymentLinksToAffiliates(affiliatePayments: any[], campaignName: string) {
    console.log('❌ SERVICE DÉSACTIVÉ: StripeExpressService.sendPaymentLinksToAffiliates');
    throw new Error('Service désactivé - Utiliser les vraies API Vercel Edge Functions');
  }
}

export const stripeExpressService = new StripeExpressService();
