
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

interface CommissionRequest {
  campaignId: string;
  startDate?: string;
  endDate?: string;
}

interface ConversionData {
  affiliateId: string;
  amount: string | number;
  commission: string | number;
  timestamp: admin.firestore.Timestamp;
}

interface AffiliateData {
  name?: string;
  email?: string;
  commissionRate?: number;
}

interface AffiliateCommission {
  affiliateId: string;
  affiliateName: string;
  affiliateEmail: string;
  totalRevenue: number;
  totalCommission: number;
  conversionCount: number;
  commissionRate: number;
  conversions: Array<{
    id: string;
    amount: number;
    commission: number;
    timestamp: admin.firestore.Timestamp;
  }>;
}

export const calculateCommissions = onCall(
  { cors: true },
  async (request) => {
    try {
      console.log('💰 COMMISSION - Début calcul commissions');
      
      // Vérifier l'authentification
      if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Utilisateur non authentifié');
      }

      const { campaignId, startDate, endDate } = request.data as CommissionRequest;
      const uid = request.auth.uid;

      // Vérifier que l'utilisateur possède cette campagne
      const campaignDoc = await admin.firestore()
        .collection('campaigns')
        .doc(campaignId)
        .get();

      if (!campaignDoc.exists || campaignDoc.data()?.userId !== uid) {
        throw new HttpsError('permission-denied', 'Accès non autorisé à cette campagne');
      }

      console.log('💰 COMMISSION - Campagne vérifiée:', campaignId);

      // Construire la requête de conversions avec filtres de date
      let conversionsQuery = admin.firestore()
        .collection('conversions')
        .where('campaignId', '==', campaignId);

      if (startDate) {
        conversionsQuery = conversionsQuery.where('timestamp', '>=', new Date(startDate));
      }

      if (endDate) {
        conversionsQuery = conversionsQuery.where('timestamp', '<=', new Date(endDate));
      }

      const conversionsSnapshot = await conversionsQuery.get();
      
      console.log('💰 COMMISSION - Conversions trouvées:', conversionsSnapshot.size);

      // Calculer les commissions par affilié
      const affiliateCommissions: { [key: string]: AffiliateCommission } = {};

      for (const doc of conversionsSnapshot.docs) {
        const conversion = doc.data() as ConversionData;
        const affiliateId = conversion.affiliateId;

        if (!affiliateCommissions[affiliateId]) {
          // Récupérer les infos de l'affilié
          const affiliateDoc = await admin.firestore()
            .collection('affiliates')
            .doc(affiliateId)
            .get();

          const affiliateData = affiliateDoc.data() as AffiliateData | undefined;
          
          affiliateCommissions[affiliateId] = {
            affiliateId,
            affiliateName: affiliateData?.name || 'Affilié inconnu',
            affiliateEmail: affiliateData?.email || '',
            totalRevenue: 0,
            totalCommission: 0,
            conversionCount: 0,
            commissionRate: affiliateData?.commissionRate || 10,
            conversions: []
          };
        }

        const amount = parseFloat(conversion.amount.toString()) || 0;
        const commission = parseFloat(conversion.commission.toString()) || 0;

        affiliateCommissions[affiliateId].totalRevenue += amount;
        affiliateCommissions[affiliateId].totalCommission += commission;
        affiliateCommissions[affiliateId].conversionCount += 1;
        affiliateCommissions[affiliateId].conversions.push({
          id: doc.id,
          amount,
          commission,
          timestamp: conversion.timestamp,
        });
      }

      const results = Object.values(affiliateCommissions);
      const totalRevenue = results.reduce((sum: number, affiliate: AffiliateCommission) => sum + affiliate.totalRevenue, 0);
      const totalCommission = results.reduce((sum: number, affiliate: AffiliateCommission) => sum + affiliate.totalCommission, 0);

      console.log('✅ COMMISSION - Calcul terminé:', {
        affiliateCount: results.length,
        totalRevenue,
        totalCommission
      });

      return {
        success: true,
        campaignId,
        period: { startDate, endDate },
        summary: {
          totalRevenue,
          totalCommission,
          affiliateCount: results.length,
          conversionCount: conversionsSnapshot.size
        },
        affiliateCommissions: results
      };

    } catch (error: unknown) {
      console.error('❌ COMMISSION - Erreur:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', 'Erreur de calcul des commissions');
    }
  }
);
