
import { PaymentDistribution } from './types';
import { EmailService } from '../emailService';

// 🆕 NOUVEAU : Service pour créer des Payment Links Stripe réels
export const createStripePaymentLinks = async (
  distribution: PaymentDistribution,
  campaignName: string
): Promise<{ affiliateId: string; paymentLinkUrl: string }[]> => {
  console.log('💳 STRIPE PAYMENT LINKS: Création des liens de paiement pour', distribution.affiliatePayments.length, 'affiliés');
  
  const paymentLinks = [];
  
  for (const payment of distribution.affiliatePayments) {
    try {
      console.log(`💳 Création Payment Link pour ${payment.affiliateName} - ${payment.totalCommission}€`);
      
      // Appel à l'API pour créer le Payment Link Stripe
      const response = await fetch('/api/stripe/create-payment-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          affiliateEmail: payment.affiliateEmail,
          affiliateName: payment.affiliateName,
          amount: Math.round(payment.totalCommission * 100), // Convertir en centimes
          description: `Commission RefSpring - Campagne "${campaignName}"`,
          campaignName: campaignName,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur création Payment Link: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log(`✅ Payment Link créé pour ${payment.affiliateName}:`, result.paymentLinkUrl);
      
      paymentLinks.push({
        affiliateId: payment.affiliateId,
        paymentLinkUrl: result.paymentLinkUrl
      });
      
    } catch (error) {
      console.error(`❌ Erreur création Payment Link pour ${payment.affiliateName}:`, error);
      // En cas d'erreur, utiliser un lien de fallback
      paymentLinks.push({
        affiliateId: payment.affiliateId,
        paymentLinkUrl: `https://refspring.com/payment-error?affiliate=${payment.affiliateId}&amount=${payment.totalCommission}`
      });
    }
  }
  
  return paymentLinks;
};

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

    // 🆕 ÉTAPE 1 : Créer les Payment Links Stripe réels
    console.log('💳 Création des Payment Links Stripe...');
    const paymentLinks = await createStripePaymentLinks(distribution, campaignName);
    
    // 🆕 ÉTAPE 2 : Préparer les données pour l'envoi groupé d'emails avec les vrais liens
    const emailData = distribution.affiliatePayments.map(payment => {
      const paymentLink = paymentLinks.find(link => link.affiliateId === payment.affiliateId);
      
      return {
        affiliateEmail: payment.affiliateEmail,
        affiliateName: payment.affiliateName,
        amount: payment.totalCommission,
        campaignName: campaignName,
        paymentLinkUrl: paymentLink?.paymentLinkUrl || `https://refspring.com/payment-error?affiliate=${payment.affiliateId}`
      };
    });

    // ÉTAPE 3 : Envoyer les emails réels via EmailJS
    const result = await EmailService.sendBulkCommissionEmails(emailData);
    
    console.log('📧 PRODUCTION: Résultat envoi emails:', {
      successful: result.successful,
      failed: result.failed,
      errors: result.errors
    });

    if (result.failed > 0) {
      console.warn('⚠️ PRODUCTION: Certains emails ont échoué:', result.errors);
    }

    console.log('✅ PRODUCTION: Processus d\'envoi d\'emails terminé avec Payment Links Stripe');

  } catch (error) {
    console.error('❌ PRODUCTION: Erreur envoi emails:', error);
    throw error;
  }
};
