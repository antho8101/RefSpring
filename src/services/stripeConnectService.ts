import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  addDoc, 
  Timestamp,
  QuerySnapshot,
  DocumentData 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { EmailService } from './emailService';

// Types pour les données de paiement et de commission
export interface CommissionData {
  campaignId: string;
  affiliateId: string;
  amount: number;
  commission: number;
  timestamp: Date;
}

export interface AffiliatePayment {
  affiliateId: string;
  affiliateName: string;
  affiliateEmail: string;
  totalCommission: number;
  conversionsCount: number;
  commissionRate: number;
}

export interface PaymentDistribution {
  totalRevenue: number;
  totalCommissions: number;
  platformFee: number;
  affiliatePayments: AffiliatePayment[];
}

export interface LastPaymentInfo {
  hasPayments: boolean;
  lastPaymentDate: Date | null;
}

// Fonction pour calculer les commissions depuis une date donnée
export const calculateCommissionsSinceDate = async (
  campaignId: string, 
  sinceDate: Date | null = null
): Promise<PaymentDistribution> => {
  console.log('💰 Calcul des commissions depuis:', sinceDate, 'pour campagne:', campaignId);

  try {
    // Récupérer les affiliés de la campagne
    const affiliatesQuery = query(
      collection(db, 'affiliates'),
      where('campaignId', '==', campaignId)
    );
    const affiliatesSnapshot = await getDocs(affiliatesQuery);
    const affiliates = affiliatesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log('👥 Affiliés trouvés:', affiliates.length);

    // Récupérer les conversions depuis la date donnée
    let conversionsQuery = query(
      collection(db, 'conversions'),
      where('campaignId', '==', campaignId),
      orderBy('createdAt', 'desc')
    );

    if (sinceDate) {
      conversionsQuery = query(
        collection(db, 'conversions'),
        where('campaignId', '==', campaignId),
        where('createdAt', '>=', Timestamp.fromDate(sinceDate)),
        orderBy('createdAt', 'desc')
      );
    }

    const conversionsSnapshot = await getDocs(conversionsQuery);
    const conversions = conversionsSnapshot.docs.map(doc => {
      const data = doc.data();
      const rawTimestamp = data.createdAt || data.timestamp;
      let convertedDate: Date;
      
      if (rawTimestamp?.toDate) {
        convertedDate = rawTimestamp.toDate();
      } else if (rawTimestamp?.seconds) {
        convertedDate = new Date(rawTimestamp.seconds * 1000);
      } else {
        convertedDate = new Date();
      }

      return {
        id: doc.id,
        rawTimestamp,
        convertedDate,
        amount: data.amount || 0,
        commission: data.commission || 0,
        affiliateId: data.affiliateId,
        ...data
      };
    });

    console.log('🔍 DÉBOGAGE - Date de référence (sinceDate):', sinceDate);
    console.log('🔍 DÉBOGAGE - Nombre total de conversions:', conversions.length);

    // Filtrer les conversions selon la date
    const filteredConversions = conversions.filter(conversion => {
      if (!sinceDate) return true;
      
      console.log('🔍 DÉBOGAGE - Conversion:', {
        id: conversion.id,
        rawTimestamp: conversion.rawTimestamp,
        convertedDate: conversion.convertedDate,
        amount: conversion.amount,
        commission: conversion.commission,
        affiliateId: conversion.affiliateId
      });
      
      const isIncluded = conversion.convertedDate >= sinceDate;
      if (isIncluded) {
        console.log('✅ DÉBOGAGE - Conversion incluse:', {
          affiliateId: conversion.affiliateId,
          affiliateName: affiliates.find(a => a.id === conversion.affiliateId)?.name,
          amount: conversion.amount,
          commission: conversion.commission
        });
      }
      return isIncluded;
    });

    // Calculer les paiements par affilié
    const affiliatePayments: AffiliatePayment[] = [];
    let totalRevenue = 0;
    let totalCommissions = 0;

    for (const affiliate of affiliates) {
      const affiliateConversions = filteredConversions.filter(c => c.affiliateId === affiliate.id);
      
      if (affiliateConversions.length > 0) {
        const affiliateRevenue = affiliateConversions.reduce((sum, c) => sum + (c.amount || 0), 0);
        const affiliateCommissions = affiliateConversions.reduce((sum, c) => sum + (c.commission || 0), 0);
        
        affiliatePayments.push({
          affiliateId: affiliate.id,
          affiliateName: affiliate.name || 'Affilié',
          affiliateEmail: affiliate.email || '',
          totalCommission: affiliateCommissions,
          conversionsCount: affiliateConversions.length,
          commissionRate: affiliate.commissionRate || 0
        });

        totalRevenue += affiliateRevenue;
        totalCommissions += affiliateCommissions;
      }
    }

    // Calculer la commission de la plateforme (25% des commissions)
    const platformFee = totalCommissions * 0.25;

    console.log('💰 Calculs terminés:', {
      totalRevenue,
      totalCommissions,
      platformFee,
      affiliatesCount: affiliatePayments.length
    });

    return {
      totalRevenue,
      totalCommissions,
      platformFee,
      affiliatePayments
    };

  } catch (error) {
    console.error('❌ Erreur calcul commissions:', error);
    throw error;
  }
};

export const getLastPaymentInfo = async (campaignId: string): Promise<LastPaymentInfo> => {
  try {
    console.log('🔍 Recherche du dernier paiement pour la campagne:', campaignId);
    
    const paymentsQuery = query(
      collection(db, 'paymentDistributions'),
      where('campaignId', '==', campaignId),
      where('status', '==', 'completed'),
      orderBy('processedAt', 'desc'),
      limit(1)
    );
    
    const paymentsSnapshot = await getDocs(paymentsQuery);
    
    if (!paymentsSnapshot.empty) {
      const lastPayment = paymentsSnapshot.docs[0].data();
      const lastPaymentDate = lastPayment.processedAt?.toDate() || null;
      console.log('✅ Dernier paiement trouvé:', lastPaymentDate);
      return {
        hasPayments: true,
        lastPaymentDate
      };
    } else {
      console.log('ℹ️ Aucun paiement précédent trouvé');
      return {
        hasPayments: false,
        lastPaymentDate: null
      };
    }
  } catch (error) {
    console.error('❌ Erreur récupération dernier paiement:', error);
    return {
      hasPayments: false,
      lastPaymentDate: null
    };
  }
};

export const createPaymentDistributionRecord = async (
  campaignId: string,
  userId: string,
  distribution: PaymentDistribution,
  reason: 'manual_payout' | 'campaign_deletion' = 'manual_payout'
): Promise<string> => {
  try {
    const totalAmount = distribution.totalCommissions + distribution.platformFee;
    
    console.log('📝 Création enregistrement distribution:', {
      campaignId,
      reason,
      totalAmount
    });

    const record = {
      campaignId,
      userId,
      reason,
      totalRevenue: distribution.totalRevenue,
      totalCommissions: distribution.totalCommissions,
      platformFee: distribution.platformFee,
      totalAmount,
      affiliatePayments: distribution.affiliatePayments,
      status: 'completed',
      processedAt: Timestamp.now(),
      createdAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'paymentDistributions'), record);
    console.log('✅ Enregistrement créé:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('❌ Erreur création enregistrement distribution:', error);
    throw error;
  }
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
