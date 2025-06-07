
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Affiliate, Conversion } from '@/types';

export interface CommissionCalculation {
  affiliateId: string;
  affiliateName: string;
  affiliateEmail: string;
  totalCommission: number;
  conversionsCount: number;
}

export interface PaymentDistribution {
  totalCommissions: number;
  platformFee: number; // 2.5% du CA
  totalRevenue: number;
  affiliatePayments: CommissionCalculation[];
}

// Calculer les commissions dues depuis une date donnée
export const calculateCommissionsSinceDate = async (
  campaignId: string,
  sinceDate: Date
): Promise<PaymentDistribution> => {
  console.log('💰 Calcul des commissions depuis:', sinceDate, 'pour campagne:', campaignId);

  try {
    // 1. Récupérer tous les affiliés de la campagne
    const affiliatesQuery = query(
      collection(db, 'affiliates'),
      where('campaignId', '==', campaignId)
    );
    const affiliatesSnapshot = await getDocs(affiliatesQuery);
    const affiliates: Record<string, Affiliate> = {};
    
    affiliatesSnapshot.docs.forEach(doc => {
      const data = doc.data() as Affiliate;
      affiliates[doc.id] = { ...data, id: doc.id };
    });

    console.log('👥 Affiliés trouvés:', Object.keys(affiliates).length);

    // 2. Récupérer toutes les conversions depuis la date donnée
    const conversionsQuery = query(
      collection(db, 'conversions'),
      where('campaignId', '==', campaignId)
    );
    const conversionsSnapshot = await getDocs(conversionsQuery);
    
    const affiliateCommissions: Record<string, CommissionCalculation> = {};
    let totalRevenue = 0;
    let totalCommissions = 0;

    conversionsSnapshot.docs.forEach(doc => {
      const conversion = doc.data() as Conversion;
      const conversionDate = conversion.timestamp.toDate ? 
        conversion.timestamp.toDate() : 
        new Date(conversion.timestamp);

      // Filtrer par date
      if (conversionDate >= sinceDate) {
        const affiliate = affiliates[conversion.affiliateId];
        if (affiliate) {
          const commission = parseFloat(conversion.commission.toString()) || 0;
          const amount = parseFloat(conversion.amount.toString()) || 0;
          
          totalRevenue += amount;
          totalCommissions += commission;

          if (!affiliateCommissions[conversion.affiliateId]) {
            affiliateCommissions[conversion.affiliateId] = {
              affiliateId: conversion.affiliateId,
              affiliateName: affiliate.name,
              affiliateEmail: affiliate.email,
              totalCommission: 0,
              conversionsCount: 0
            };
          }

          affiliateCommissions[conversion.affiliateId].totalCommission += commission;
          affiliateCommissions[conversion.affiliateId].conversionsCount += 1;
        }
      }
    });

    const platformFee = totalRevenue * 0.025; // 2.5% du CA
    const affiliatePayments = Object.values(affiliateCommissions);

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

// Créer un enregistrement de distribution de paiement
export const createPaymentDistributionRecord = async (
  campaignId: string,
  userId: string,
  distribution: PaymentDistribution,
  reason: 'campaign_deletion' | 'monthly_payment'
) => {
  console.log('📝 Création enregistrement distribution:', {
    campaignId,
    reason,
    totalAmount: distribution.totalCommissions + distribution.platformFee
  });

  try {
    const record = {
      campaignId,
      userId,
      reason,
      totalRevenue: distribution.totalRevenue,
      totalCommissions: distribution.totalCommissions,
      platformFee: distribution.platformFee,
      affiliatePayments: distribution.affiliatePayments,
      status: 'pending',
      createdAt: new Date(),
      processedAt: null
    };

    const docRef = await addDoc(collection(db, 'paymentDistributions'), record);
    console.log('✅ Enregistrement créé:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Erreur création enregistrement:', error);
    throw error;
  }
};

// Simuler l'envoi des liens de paiement Stripe (pour l'instant)
export const sendStripePaymentLinks = async (
  distribution: PaymentDistribution,
  campaignName: string
): Promise<void> => {
  console.log('📧 Simulation envoi liens de paiement Stripe pour:', campaignName);
  
  // Simuler l'envoi pour chaque affilié
  for (const payment of distribution.affiliatePayments) {
    if (payment.totalCommission > 0) {
      console.log(`📧 Lien envoyé à ${payment.affiliateEmail}: ${payment.totalCommission.toFixed(2)}€`);
      
      // TODO: Intégrer avec Stripe Connect Express
      // - Créer/vérifier le compte Express de l'affilié
      // - Générer un Payment Link pour le montant dû
      // - Envoyer l'email avec le lien
    }
  }

  // Simuler le paiement de notre commission
  if (distribution.platformFee > 0) {
    console.log(`💰 Commission RefSpring: ${distribution.platformFee.toFixed(2)}€`);
  }

  console.log('✅ Tous les liens de paiement ont été envoyés');
};
