
import { stripeBackendService } from './stripeBackendService';
import { EmailService } from './emailService';

// Service pour gérer l'intégration avec notre backend simulé
export class StripeExpressService {
  // Simuler les endpoints backend pour le développement
  async handleCreateSetup(data: { campaignId: string; campaignName: string; userEmail: string }) {
    try {
      console.log('🔄 Traitement création setup pour:', data.userEmail);
      
      // 1. Créer ou récupérer le client Stripe
      const customer = await stripeBackendService.createOrGetCustomer(data.userEmail);
      
      // 2. Créer la session de checkout réelle
      const checkoutSession = await stripeBackendService.createCheckoutSession(
        customer.id, 
        data.campaignName, 
        data.campaignId
      );
      
      return {
        setupIntentId: checkoutSession.id, // Utiliser l'ID de session comme référence
        stripeCustomerId: customer.id,
        checkoutUrl: checkoutSession.url, // URL réelle générée par Stripe
      };
    } catch (error) {
      console.error('❌ Erreur création setup:', error);
      throw error;
    }
  }

  async handleCheckSetup(setupIntentId: string) {
    try {
      console.log('🔍 Vérification setup:', setupIntentId);
      
      // Récupérer la session de checkout au lieu du SetupIntent
      const session = await stripeBackendService.getCheckoutSession(setupIntentId);
      
      // Pour les sessions setup, le statut peut être 'complete' quand le setup_intent est réussi
      let status = 'incomplete';
      if (session.status === 'complete' && session.setup_intent) {
        // Récupérer les détails du SetupIntent pour vérifier son statut
        const setupIntent = await stripeBackendService.getSetupIntent(session.setup_intent);
        if (setupIntent.status === 'succeeded') {
          status = 'succeeded';
        }
      }
      
      return {
        status: status,
        paymentMethod: session.setup_intent, // La session contient le setup_intent
      };
    } catch (error) {
      console.error('❌ Erreur vérification setup:', error);
      throw error;
    }
  }

  async sendPaymentLinksToAffiliates(affiliatePayments: any[], campaignName: string) {
    console.log('📧 Envoi des vrais emails avec Payment Links aux affiliés');
    
    const results = [];
    const emailsToSend = [];
    
    // Préparer tous les Payment Links d'abord
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
          
          // Préparer les données pour l'email
          emailsToSend.push({
            affiliateEmail: payment.affiliateEmail,
            affiliateName: payment.affiliateName,
            amount: payment.totalCommission,
            campaignName: campaignName,
            paymentLinkUrl: paymentLink.url,
          });
          
          results.push({
            affiliateEmail: payment.affiliateEmail,
            amount: payment.totalCommission,
            paymentLinkUrl: paymentLink.url,
            status: 'link_created'
          });
          
          // Délai pour éviter le rate limiting Stripe
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          console.error(`❌ Erreur création Payment Link pour ${payment.affiliateEmail}:`, error);
          results.push({
            affiliateEmail: payment.affiliateEmail,
            status: 'error',
            error: error.message
          });
        }
      }
    }
    
    // Envoyer tous les emails en lot
    if (emailsToSend.length > 0) {
      console.log(`📧 Envoi de ${emailsToSend.length} emails de commission`);
      
      const emailResults = await EmailService.sendBulkCommissionEmails(emailsToSend);
      
      console.log(`✅ Résultats envoi emails: ${emailResults.successful} succès, ${emailResults.failed} échecs`);
      
      if (emailResults.errors.length > 0) {
        console.log('❌ Erreurs emails:', emailResults.errors);
      }
      
      // Mettre à jour les résultats avec le statut d'envoi d'email
      results.forEach(result => {
        if (result.status === 'link_created') {
          const emailSent = emailResults.successful > 0; // Simplification pour l'exemple
          result.status = emailSent ? 'sent' : 'email_error';
        }
      });
    }
    
    console.log('✅ Tous les Payment Links et emails ont été traités');
    return results;
  }
}

export const stripeExpressService = new StripeExpressService();
