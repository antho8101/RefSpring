
import { PaymentDistribution } from './types';
import { EmailService } from '../emailService';

export const sendStripePaymentLinks = async (
  distribution: PaymentDistribution,
  campaignName: string
): Promise<void> => {
  try {
    console.log('📧 PRODUCTION: Envoi d\'emails réels pour:', campaignName);
    console.log('💰 Nombre d\'affiliés à payer:', distribution.affiliatePayments.length);

    if (distribution.affiliatePayments.length === 0) {
      console.log('ℹ️ Aucun affilié à payer');
      return;
    }

    // Préparer les données pour l'envoi groupé d'emails
    const emailData = distribution.affiliatePayments.map(payment => ({
      affiliateEmail: payment.affiliateEmail,
      affiliateName: payment.affiliateName,
      amount: payment.totalCommission,
      campaignName: campaignName,
      paymentLinkUrl: `https://refspring.com/payment-received?amount=${payment.totalCommission}&campaign=${encodeURIComponent(campaignName)}`
    }));

    // Envoyer les emails réels via EmailJS
    const result = await EmailService.sendBulkCommissionEmails(emailData);
    
    console.log('📧 PRODUCTION: Résultat envoi emails:', {
      successful: result.successful,
      failed: result.failed,
      errors: result.errors
    });

    if (result.failed > 0) {
      console.warn('⚠️ PRODUCTION: Certains emails ont échoué:', result.errors);
    }

    console.log('✅ PRODUCTION: Processus d\'envoi d\'emails terminé');

  } catch (error) {
    console.error('❌ PRODUCTION: Erreur envoi emails:', error);
    throw error;
  }
};
