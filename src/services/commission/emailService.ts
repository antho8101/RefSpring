
import { PaymentDistribution } from './types';
import { EmailService } from '../emailService';

// 🆕 NOUVEAU : Service Stripe Connect pour transfers automatiques
export const processStripeTransfers = async (
  distribution: PaymentDistribution,
  campaignName: string
): Promise<void> => {
  try {
    console.log('💸 STRIPE CONNECT: Traitement des transfers pour:', campaignName);
    console.log('💰 Nombre d\'affiliés à payer:', distribution.affiliatePayments.length);

    if (distribution.affiliatePayments.length === 0) {
      console.log('ℹ️ Aucun affilié à payer');
      return;
    }

    const transferResults = [];

    // Traiter chaque paiement d'affilié
    for (const payment of distribution.affiliatePayments) {
      try {
        // Vérifier que l'affilié a un compte Stripe Connect
        if (!payment.stripeAccountId) {
          console.warn(`⚠️ STRIPE CONNECT: Affilié ${payment.affiliateName} n'a pas de compte Stripe Connect`);
          transferResults.push({
            affiliateId: payment.affiliateId,
            status: 'failed',
            error: 'Compte Stripe Connect non configuré'
          });
          continue;
        }

        console.log(`💸 Création transfer pour ${payment.affiliateName} - ${payment.totalCommission}€`);
        
        // Créer le transfer Stripe
        const response = await fetch('/api/stripe/create-transfer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            accountId: payment.stripeAccountId,
            amount: Math.round(payment.totalCommission * 100), // Convertir en centimes
            description: `Commission RefSpring - Campagne "${campaignName}"`,
            metadata: {
              affiliate_id: payment.affiliateId,
              affiliate_name: payment.affiliateName,
              campaign_name: campaignName,
              commission_amount: payment.totalCommission.toString(),
            },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Erreur transfer: ${response.status} - ${errorText}`);
        }

        const transferData = await response.json();
        console.log(`✅ Transfer créé pour ${payment.affiliateName}:`, transferData.transferId);
        
        transferResults.push({
          affiliateId: payment.affiliateId,
          status: 'success',
          transferId: transferData.transferId,
          amount: transferData.amount
        });
        
      } catch (error) {
        console.error(`❌ Erreur transfer pour ${payment.affiliateName}:`, error);
        transferResults.push({
          affiliateId: payment.affiliateId,
          status: 'failed',
          error: error.message
        });
      }
    }

    // Compter les résultats
    const successful = transferResults.filter(r => r.status === 'success').length;
    const failed = transferResults.filter(r => r.status === 'failed').length;

    console.log('📊 STRIPE CONNECT: Résultats transfers:', {
      successful,
      failed,
      total: transferResults.length
    });

    if (failed > 0) {
      console.warn('⚠️ STRIPE CONNECT: Certains transfers ont échoué:', 
        transferResults.filter(r => r.status === 'failed')
      );
    }

    console.log('✅ STRIPE CONNECT: Processus de transfers terminé');

  } catch (error) {
    console.error('❌ STRIPE CONNECT: Erreur générale transfers:', error);
    throw error;
  }
};

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

// 🔄 MIGRATION: Nouvelle fonction principale qui utilise Stripe Connect si possible, sinon Payment Links
export const sendStripePaymentLinks = async (
  distribution: PaymentDistribution,
  campaignName: string
): Promise<void> => {
  try {
    console.log('🔄 PAYMENT SYSTEM: Démarrage processus de paiement hybride pour:', campaignName);
    
    // Séparer les affiliés avec/sans Stripe Connect
    const affiliatesWithStripeConnect = distribution.affiliatePayments.filter(p => p.stripeAccountId);
    const affiliatesWithoutStripeConnect = distribution.affiliatePayments.filter(p => !p.stripeAccountId);
    
    console.log('📊 PAYMENT SYSTEM: Répartition des affiliés:', {
      withStripeConnect: affiliatesWithStripeConnect.length,
      withoutStripeConnect: affiliatesWithoutStripeConnect.length,
      total: distribution.affiliatePayments.length
    });

    // ÉTAPE 1: Traiter les transfers Stripe Connect (automatiques)
    if (affiliatesWithStripeConnect.length > 0) {
      console.log('💸 Traitement des transfers Stripe Connect...');
      await processStripeTransfers({
        ...distribution,
        affiliatePayments: affiliatesWithStripeConnect
      }, campaignName);
    }

    // ÉTAPE 2: Traiter les Payment Links pour les autres (emails)
    if (affiliatesWithoutStripeConnect.length > 0) {
      console.log('📧 Traitement des Payment Links pour affiliés sans Stripe Connect...');
      await sendStripePaymentLinksLegacy({
        ...distribution,
        affiliatePayments: affiliatesWithoutStripeConnect
      }, campaignName);
    }

    console.log('✅ PAYMENT SYSTEM: Processus de paiement hybride terminé');

  } catch (error) {
    console.error('❌ PAYMENT SYSTEM: Erreur processus hybride:', error);
    throw error;
  }
};

// 🔄 RENOMMAGE: Ancienne fonction pour les Payment Links
export const sendStripePaymentLinksLegacy = async (
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
