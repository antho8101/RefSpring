
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PaymentDistribution, AffiliateData, ConversionData } from './types';

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
    const affiliates: AffiliateData[] = affiliatesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AffiliateData));

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
    const conversions: ConversionData[] = conversionsSnapshot.docs.map(doc => {
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
        affiliateId: data.affiliateId,
        campaignId: data.campaignId,
        amount: data.amount || 0,
        commission: data.commission || 0,
        createdAt: rawTimestamp,
        convertedDate,
      };
    });

    console.log('🔍 DÉBOGAGE - Date de référence (sinceDate):', sinceDate);
    console.log('🔍 DÉBOGAGE - Nombre total de conversions:', conversions.length);

    // Filtrer les conversions selon la date
    const filteredConversions = conversions.filter(conversion => {
      if (!sinceDate) return true;
      
      console.log('🔍 DÉBOGAGE - Conversion:', {
        id: conversion.id,
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
    const affiliatePayments = [];
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
