
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Affiliate, Conversion } from '@/types';
import { stripeExpressService } from './stripeExpressService';

export interface CommissionCalculation {
  affiliateId: string;
  affiliateName: string;
  affiliateEmail: string;
  totalCommission: number;
  conversionsCount: number;
}

export interface PaymentDistribution {
  totalCommissions: number;
  platformFee: number;
  totalRevenue: number;
  affiliatePayments: CommissionCalculation[];
}

export interface LastPaymentInfo {
  hasPayments: boolean;
  lastPaymentDate: Date | null;
}

// Récupérer les informations du dernier paiement pour une campagne
export const getLastPaymentInfo = async (campaignId: string): Promise<LastPaymentInfo> => {
  console.log('🔍 Recherche du dernier paiement pour la campagne:', campaignId);
  
  try {
    const paymentsQuery = query(
      collection(db, 'paymentDistributions'),
      where('campaignId', '==', campaignId),
      where('status', '==', 'completed'),
      orderBy('processedAt', 'desc'),
      limit(1)
    );
    
    const paymentsSnapshot = await getDocs(paymentsQuery);
    
    if (paymentsSnapshot.empty) {
      console.log('💡 Aucun paiement précédent trouvé pour cette campagne');
      return {
        hasPayments: false,
        lastPaymentDate: null
      };
    }
    
    const lastPayment = paymentsSnapshot.docs[0].data();
    const lastPaymentDate = lastPayment.processedAt?.toDate() || lastPayment.createdAt?.toDate();
    
    console.log('✅ Dernier paiement trouvé:', lastPaymentDate);
    return {
      hasPayments: true,
      lastPaymentDate
    };
  } catch (error) {
    console.error('❌ Erreur récupération dernier paiement:', error);
    // En cas d'erreur, on considère qu'il n'y a pas de paiements précédents
    return {
      hasPayments: false,
      lastPaymentDate: null
    };
  }
};

// Calculer les commissions dues depuis une date donnée
export const calculateCommissionsSinceDate = async (
  campaignId: string,
  sinceDate: Date | null
): Promise<PaymentDistribution> => {
  console.log('💰 Calcul des commissions depuis:', sinceDate, 'pour campagne:', campaignId);

  try {
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

    const conversionsQuery = query(
      collection(db, 'conversions'),
      where('campaignId', '==', campaignId)
    );
    const conversionsSnapshot = await getDocs(conversionsQuery);
    
    const affiliateCommissions: Record<string, CommissionCalculation> = {};
    let totalRevenue = 0;
    let totalCommissions = 0;

    console.log('🔍 DÉBOGAGE - Date de référence (sinceDate):', sinceDate);
    console.log('🔍 DÉBOGAGE - Nombre total de conversions:', conversionsSnapshot.docs.length);

    conversionsSnapshot.docs.forEach(doc => {
      const conversion = doc.data() as Conversion;
      
      // CORRECTION : Gérer correctement les différents types de timestamp
      let conversionDate: Date;
      
      // Vérifier si c'est un Timestamp Firestore avec une méthode toDate
      if (conversion.timestamp && typeof conversion.timestamp === 'object' && 'toDate' in conversion.timestamp && typeof conversion.timestamp.toDate === 'function') {
        conversionDate = (conversion.timestamp as any).toDate();
      } 
      // Vérifier si c'est déjà un objet Date
      else if (conversion.timestamp instanceof Date) {
        conversionDate = conversion.timestamp;
      }
      // Vérifier si c'est un objet avec une propriété seconds (Timestamp format)
      else if (conversion.timestamp && typeof conversion.timestamp === 'object' && 'seconds' in conversion.timestamp) {
        conversionDate = new Date((conversion.timestamp as any).seconds * 1000);
      }
      // Sinon, essayer de convertir directement
      else {
        conversionDate = new Date(conversion.timestamp as any);
      }

      console.log('🔍 DÉBOGAGE - Conversion:', {
        id: doc.id,
        rawTimestamp: conversion.timestamp,
        convertedDate: conversionDate,
        amount: conversion.amount,
        commission: conversion.commission,
        isAfterSinceDate: sinceDate ? conversionDate >= sinceDate : true
      });

      // Si sinceDate est null, on prend toutes les conversions
      if (!sinceDate || conversionDate >= sinceDate) {
        const affiliate = affiliates[conversion.affiliateId];
        if (affiliate) {
          const commission = parseFloat(conversion.commission.toString()) || 0;
          const amount = parseFloat(conversion.amount.toString()) || 0;
          
          totalRevenue += amount;
          totalCommissions += commission;

          console.log('✅ DÉBOGAGE - Conversion incluse:', {
            affiliateId: conversion.affiliateId,
            affiliateName: affiliate.name,
            amount,
            commission
          });

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
        } else {
          console.log('⚠️ DÉBOGAGE - Affilié non trouvé pour la conversion:', conversion.affiliateId);
        }
      } else {
        console.log('❌ DÉBOGAGE - Conversion exclue (trop ancienne):', {
          conversionDate,
          sinceDate,
          difference: sinceDate.getTime() - conversionDate.getTime()
        });
      }
    });

    const platformFee = totalRevenue * 0.025;
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

// Fonction mise à jour pour envoyer de vrais Payment Links Stripe
export const sendStripePaymentLinks = async (
  distribution: PaymentDistribution,
  campaignName: string
): Promise<void> => {
  console.log('📧 Envoi des vrais Payment Links Stripe pour:', campaignName);
  
  try {
    // Utiliser le service Stripe Express pour envoyer les Payment Links
    const results = await stripeExpressService.sendPaymentLinksToAffiliates(
      distribution.affiliatePayments,
      campaignName
    );
    
    // Traiter les résultats
    const successCount = results.filter(r => r.status === 'sent').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    
    console.log(`✅ Payment Links envoyés: ${successCount} succès, ${errorCount} erreurs`);
    
    // Afficher les liens générés pour débogage
    results.forEach(result => {
      if (result.status === 'sent') {
        console.log(`💰 ${result.affiliateEmail}: ${result.paymentLinkUrl}`);
      }
    });
    
    // Gérer notre commission RefSpring
    if (distribution.platformFee > 0) {
      console.log(`💰 Commission RefSpring à percevoir: ${distribution.platformFee.toFixed(2)}€`);
    }

    console.log('✅ Processus de distribution terminé');
  } catch (error) {
    console.error('❌ Erreur envoi Payment Links:', error);
    throw error;
  }
};
