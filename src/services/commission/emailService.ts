
import { PaymentDistribution } from './types';
import { EmailService } from '../emailService';
import { functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';

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
        
        // Créer le transfer Stripe via Firebase
        const createTransfer = httpsCallable(functions, 'stripeCreateTransfer');
        
        const transferResult = await createTransfer({
          accountId: payment.stripeAccountId,
          amount: Math.round(payment.totalCommission * 100), // Convertir en centimes
          description: `Commission RefSpring - Campagne "${campaignName}"`,
          metadata: {
            affiliate_id: payment.affiliateId,
            affiliate_name: payment.affiliateName,
            campaign_name: campaignName,
            commission_amount: payment.totalCommission.toString(),
          },
        });

        const transferData = transferResult.data as any;
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

// 🆕 NOUVEAU : Service pour envoyer des emails d'information de commission (pas de Payment Links!)
export const sendCommissionNotificationEmails = async (
  distribution: PaymentDistribution,
  campaignName: string
): Promise<void> => {
  try {
    console.log('📧 COMMISSION EMAILS: Envoi d\'emails d\'information pour', distribution.affiliatePayments.length, 'affiliés');
    
    if (distribution.affiliatePayments.length === 0) {
      console.log('ℹ️ Aucun affilié à notifier');
      return;
    }
    
    // Préparer les données pour l'envoi d'emails de notification 
    const emailData = distribution.affiliatePayments.map(payment => ({
      affiliateEmail: payment.affiliateEmail,
      affiliateName: payment.affiliateName,
      amount: payment.totalCommission,
      campaignName: campaignName,
      // URL vers une page d'information au lieu d'un payment link
      paymentLinkUrl: `https://refspring.com/commission-info?amount=${payment.totalCommission}&campaign=${encodeURIComponent(campaignName)}&affiliate=${payment.affiliateId}&email=${encodeURIComponent(payment.affiliateEmail)}&name=${encodeURIComponent(payment.affiliateName)}`
    }));

    // Envoyer les emails d'information via EmailJS
    const result = await EmailService.sendBulkCommissionEmails(emailData);
    
    console.log('📧 COMMISSION EMAILS: Résultat envoi emails:', {
      successful: result.successful,
      failed: result.failed,
      errors: result.errors
    });

    if (result.failed > 0) {
      console.warn('⚠️ COMMISSION EMAILS: Certains emails ont échoué:', result.errors);
    }

    console.log('✅ COMMISSION EMAILS: Processus d\'envoi d\'emails d\'information terminé');

  } catch (error) {
    console.error('❌ COMMISSION EMAILS: Erreur envoi emails:', error);
    throw error;
  }
};

// 🔄 CORRECTION MAJEURE: Processus de paiement correct pour les affiliés
export const sendStripePaymentLinks = async (
  distribution: PaymentDistribution,
  campaignName: string
): Promise<void> => {
  try {
    console.log('💰 COMMISSION SYSTEM: Démarrage du système de commissions pour:', campaignName);
    
    // Séparer les affiliés avec/sans Stripe Connect
    const affiliatesWithStripeConnect = distribution.affiliatePayments.filter(p => p.stripeAccountId);
    const affiliatesWithoutStripeConnect = distribution.affiliatePayments.filter(p => !p.stripeAccountId);
    
    console.log('📊 COMMISSION SYSTEM: Répartition des affiliés:', {
      withStripeConnect: affiliatesWithStripeConnect.length,
      withoutStripeConnect: affiliatesWithoutStripeConnect.length,
      total: distribution.affiliatePayments.length
    });

    // ÉTAPE 1: Traiter les transfers Stripe Connect (automatiques - ARGENT ENVOYÉ AUX AFFILIÉS)
    if (affiliatesWithStripeConnect.length > 0) {
      console.log('💸 Envoi d\'argent aux affiliés via Stripe Connect...');
      await processStripeTransfers({
        ...distribution,
        affiliatePayments: affiliatesWithStripeConnect
      }, campaignName);
    }

    // ÉTAPE 2: Pour les affiliés sans Stripe Connect - ENVOYER EMAIL D'INFO SEULEMENT
    if (affiliatesWithoutStripeConnect.length > 0) {
      console.log('📧 Envoi d\'emails d\'information pour affiliés sans Stripe Connect...');
      await sendCommissionNotificationEmails({
        ...distribution,
        affiliatePayments: affiliatesWithoutStripeConnect
      }, campaignName);
    }

    console.log('✅ COMMISSION SYSTEM: Toutes les commissions ont été traitées');

  } catch (error) {
    console.error('❌ COMMISSION SYSTEM: Erreur traitement commissions:', error);
    throw error;
  }
};

// 🗑️ SUPPRIMÉ: Cette fonction était défectueuse - elle créait des liens où les affiliés payaient au lieu de recevoir
// Les Payment Links sont pour que quelqu'un PAIE, pas pour recevoir de l'argent !
// Maintenant on utilise:
// 1. Stripe Connect Transfers pour les affiliés avec compte configuré 
// 2. Emails d'information pour les autres (leur expliquant comment configurer Stripe Connect)
