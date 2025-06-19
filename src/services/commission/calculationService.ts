
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

    // 🔍 DÉBOGAGE RENFORCÉ - Récupérer TOUTES les conversions pour cette campagne d'abord
    console.log('🔍 DÉBOGAGE - Recherche de TOUTES les conversions pour campagne:', campaignId);
    
    const allConversionsQuery = query(
      collection(db, 'conversions'),
      where('campaignId', '==', campaignId)
    );
    const allConversionsSnapshot = await getDocs(allConversionsQuery);
    
    console.log('🔍 DÉBOGAGE - TOUTES les conversions trouvées:', allConversionsSnapshot.size);
    
    // Log détaillé de chaque conversion trouvée
    allConversionsSnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      const timestamp = data.createdAt || data.timestamp;
      const convertedDate = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      
      console.log(`🔍 DÉBOGAGE - Conversion ${index + 1}:`, {
        id: doc.id,
        campaignId: data.campaignId,
        affiliateId: data.affiliateId,
        amount: data.amount,
        commission: data.commission,
        rawTimestamp: timestamp,
        convertedDate: convertedDate,
        isAfterSinceDate: sinceDate ? convertedDate >= sinceDate : true,
        sinceDateForComparison: sinceDate
      });
    });

    // 🆕 NOUVELLE LOGIQUE : Si aucune conversion récente, on propose quand même la suppression
    // mais avec un avertissement que tout a déjà été payé
    
    // Récupérer les conversions selon la logique habituelle
    let conversionsQuery = query(
      collection(db, 'conversions'),
      where('campaignId', '==', campaignId)
    );

    if (sinceDate) {
      console.log('🔍 DÉBOGAGE - Ajout filtre date:', sinceDate);
      conversionsQuery = query(
        collection(db, 'conversions'),
        where('campaignId', '==', campaignId),
        where('createdAt', '>=', Timestamp.fromDate(sinceDate))
      );
    }

    const conversionsSnapshot = await getDocs(conversionsQuery);
    
    console.log('🔍 DÉBOGAGE - Date de référence (sinceDate):', sinceDate);
    console.log('🔍 DÉBOGAGE - Conversions après filtre date:', conversionsSnapshot.size);

    const conversions: ConversionData[] = conversionsSnapshot.docs.map(doc => {
      const data = doc.data();
      // 🔍 DÉBOGAGE - Essayer plusieurs champs pour le timestamp
      let rawTimestamp = data.createdAt || data.timestamp;
      let convertedDate: Date;
      
      if (rawTimestamp?.toDate) {
        convertedDate = rawTimestamp.toDate();
      } else if (rawTimestamp?.seconds) {
        convertedDate = new Date(rawTimestamp.seconds * 1000);
      } else {
        convertedDate = new Date();
        console.log('⚠️ DÉBOGAGE - Aucun timestamp valide trouvé pour la conversion:', doc.id);
      }

      console.log('🔍 DÉBOGAGE - Traitement conversion:', {
        id: doc.id,
        rawTimestamp,
        convertedDate,
        amount: data.amount,
        commission: data.commission
      });

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

    console.log('🔍 DÉBOGAGE - Nombre total de conversions après traitement:', conversions.length);

    // Filtrer les conversions selon la date
    const filteredConversions = conversions.filter(conversion => {
      if (!sinceDate) return true;
      
      console.log('🔍 DÉBOGAGE - Test filtre conversion:', {
        id: conversion.id,
        convertedDate: conversion.convertedDate,
        sinceDate: sinceDate,
        isIncluded: conversion.convertedDate >= sinceDate
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

    console.log('🔍 DÉBOGAGE - Conversions après filtrage final:', filteredConversions.length);

    // 🆕 NOUVELLE LOGIQUE : Calculer aussi les totaux historiques pour information
    const allConversions: ConversionData[] = allConversionsSnapshot.docs.map(doc => {
      const data = doc.data();
      let rawTimestamp = data.createdAt || data.timestamp;
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

    const totalHistoricalRevenue = allConversions.reduce((sum, c) => sum + (c.amount || 0), 0);
    const totalHistoricalCommissions = allConversions.reduce((sum, c) => sum + (c.commission || 0), 0);

    console.log('📊 DÉBOGAGE - Totaux historiques:', {
      totalHistoricalRevenue,
      totalHistoricalCommissions,
      conversionsCount: allConversions.length
    });

    // Calculer les paiements par affilié POUR LES NOUVELLES CONVERSIONS
    const affiliatePayments = [];
    let totalRevenue = 0;
    let totalCommissions = 0;

    for (const affiliate of affiliates) {
      const affiliateConversions = filteredConversions.filter(c => c.affiliateId === affiliate.id);
      
      console.log(`👤 DÉBOGAGE - Affilié ${affiliate.name}:`, {
        id: affiliate.id,
        conversions: affiliateConversions.length
      });
      
      if (affiliateConversions.length > 0) {
        const affiliateRevenue = affiliateConversions.reduce((sum, c) => sum + (c.amount || 0), 0);
        const affiliateCommissions = affiliateConversions.reduce((sum, c) => sum + (c.commission || 0), 0);
        
        console.log(`💰 DÉBOGAGE - Totaux affilié ${affiliate.name}:`, {
          revenue: affiliateRevenue,
          commissions: affiliateCommissions
        });
        
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

    // Calculer la commission de la plateforme (25% des commissions des nouvelles conversions)
    const platformFee = totalCommissions * 0.25;

    console.log('💰 Calculs terminés:', {
      nouvellesTotalRevenue: totalRevenue,
      nouvellesTotalCommissions: totalCommissions,
      nouvellesPlatformFee: platformFee,
      affiliatesCount: affiliatePayments.length,
      historicalInfo: {
        totalHistoricalRevenue,
        totalHistoricalCommissions,
        totalHistoricalConversions: allConversions.length
      }
    });

    // 🆕 AVERTISSEMENT : Si pas de nouvelles commissions mais des historiques
    if (filteredConversions.length === 0 && allConversions.length > 0) {
      console.log('⚠️ AVERTISSEMENT - Aucune nouvelle commission depuis le dernier paiement');
      console.log('📊 Mais il y a des commissions historiques:', {
        historicalRevenue: totalHistoricalRevenue,
        historicalCommissions: totalHistoricalCommissions
      });
    }

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
