
import { EmailService } from './emailService';

// Service pour gérer l'intégration avec les vraies API Vercel Edge Functions
export class StripeExpressService {
  // Toutes les méthodes utilisent maintenant les vraies API Vercel Edge Functions
  async handleCreateSetup(data: { campaignId: string; campaignName: string; userEmail: string }) {
    console.log('🔄 PRODUCTION: Redirection vers createPaymentSetup des vraies API Vercel');
    throw new Error('Cette méthode est obsolète - Utiliser directement createPaymentSetup depuis stripeUtils');
  }

  async handleCheckSetup(setupIntentId: string) {
    console.log('🔄 PRODUCTION: Redirection vers checkPaymentSetupStatus des vraies API Vercel');
    throw new Error('Cette méthode est obsolète - Utiliser directement checkPaymentSetupStatus depuis stripeUtils');
  }

  async sendPaymentLinksToAffiliates(affiliatePayments: any[], campaignName: string) {
    console.log('📧 Envoi des vrais emails avec Payment Links aux affiliés');
    
    const results = [];
    const emailsToSend = [];
    
    // Cette fonctionnalité nécessiterait les vraies API Stripe pour créer des Payment Links
    console.log('⚠️ DÉSACTIVÉ: sendPaymentLinksToAffiliates - Nécessite une implémentation backend complète');
    
    // Pour l'instant, simuler l'envoi d'emails sans Payment Links réels
    for (const payment of affiliatePayments) {
      if (payment.totalCommission > 0) {
        emailsToSend.push({
          affiliateEmail: payment.affiliateEmail,
          affiliateName: payment.affiliateName,
          amount: payment.totalCommission,
          campaignName: campaignName,
          paymentLinkUrl: `mailto:${payment.affiliateEmail}?subject=Commission RefSpring&body=Votre commission de ${payment.totalCommission}€ sera traitée manuellement.`,
        });
        
        results.push({
          affiliateEmail: payment.affiliateEmail,
          amount: payment.totalCommission,
          status: 'email_prepared'
        });
      }
    }
    
    console.log(`📧 ${emailsToSend.length} emails préparés pour envoi manuel`);
    return results;
  }
}

export const stripeExpressService = new StripeExpressService();
