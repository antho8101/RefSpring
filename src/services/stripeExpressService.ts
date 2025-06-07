
import { stripeBackendService } from './stripeBackendService';

// Service pour gérer l'intégration avec notre backend simulé
export class StripeExpressService {
  // Simuler les endpoints backend pour le développement
  async handleCreateSetup(data: { campaignId: string; campaignName: string; userEmail: string }) {
    try {
      console.log('🔄 Traitement création setup pour:', data.userEmail);
      
      // 1. Créer ou récupérer le client Stripe
      const customer = await stripeBackendService.createOrGetCustomer(data.userEmail);
      
      // 2. Créer le SetupIntent
      const setupIntent = await stripeBackendService.createSetupIntent(customer.id, data.campaignName);
      
      // 3. Construire l'URL de redirection Stripe
      const checkoutUrl = `https://checkout.stripe.com/c/pay/${setupIntent.client_secret}#fidkdWxOYHwnPyd1blpxYHZxWjA0TUl9VHx2YnM8SkNmZGBHPUN1d2lIVlN3fUxAaDNMUkNJXDVfNjVdN0JnQT1SXzhOXyU2U001dUpOQ3x1YklOV0p8TnM0SVdEckZvVnNdfVROQGpVaUhJVz03X2NfYCcpJ2N3amhWYHdzYHcnP3F3cGApJ2lkfGpwcVF8dWAnPyd2bGtiaWBabHFgaCcpJ2BrZGdpYFVpZGZgbWppYWB3dic%2FcXdwYCknaWR8aEZiXWFgeSUl`;
      
      return {
        setupIntentId: setupIntent.id,
        stripeCustomerId: customer.id,
        checkoutUrl: checkoutUrl,
      };
    } catch (error) {
      console.error('❌ Erreur création setup:', error);
      throw error;
    }
  }

  async handleCheckSetup(setupIntentId: string) {
    try {
      console.log('🔍 Vérification setup:', setupIntentId);
      
      const setupIntent = await stripeBackendService.getSetupIntent(setupIntentId);
      
      return {
        status: setupIntent.status,
        paymentMethod: setupIntent.payment_method,
      };
    } catch (error) {
      console.error('❌ Erreur vérification setup:', error);
      throw error;
    }
  }

  async sendPaymentLinksToAffiliates(affiliatePayments: any[], campaignName: string) {
    console.log('📧 Envoi des Payment Links aux affiliés');
    
    const results = [];
    
    for (const payment of affiliatePayments) {
      if (payment.totalCommission > 0) {
        try {
          // Créer le Payment Link Stripe
          const paymentLink = await stripeBackendService.createPaymentLink(
            payment.totalCommission,
            'eur',
            payment.affiliateEmail,
            campaignName
          );
          
          // Simuler l'envoi d'email (en vrai, vous utiliseriez un service d'email)
          console.log(`📧 Payment Link envoyé à ${payment.affiliateEmail}:`);
          console.log(`   💰 Montant: ${payment.totalCommission.toFixed(2)}€`);
          console.log(`   🔗 Lien: ${paymentLink.url}`);
          
          results.push({
            affiliateEmail: payment.affiliateEmail,
            amount: payment.totalCommission,
            paymentLinkUrl: paymentLink.url,
            status: 'sent'
          });
          
          // Délai pour éviter le rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`❌ Erreur envoi à ${payment.affiliateEmail}:`, error);
          results.push({
            affiliateEmail: payment.affiliateEmail,
            status: 'error',
            error: error.message
          });
        }
      }
    }
    
    console.log('✅ Tous les Payment Links ont été traités');
    return results;
  }
}

export const stripeExpressService = new StripeExpressService();
