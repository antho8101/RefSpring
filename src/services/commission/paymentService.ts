
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  addDoc, 
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LastPaymentInfo, PaymentDistribution } from './types';

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

    // 🔥 CORRECTION CRITIQUE: Nettoyer les valeurs undefined pour Firestore
    const cleanAffiliatePayments = distribution.affiliatePayments.map(payment => ({
      affiliateId: payment.affiliateId || '',
      affiliateName: payment.affiliateName || '',
      affiliateEmail: payment.affiliateEmail || '',
      totalCommission: payment.totalCommission || 0,
      conversionsCount: payment.conversionsCount || 0,
      commissionRate: payment.commissionRate || 0,
      // Stripe Connect : nettoyer les undefined
      ...(payment.stripeAccountId && { stripeAccountId: payment.stripeAccountId })
    }));

    const record = {
      campaignId: campaignId || '',
      userId: userId || '',
      reason: reason || 'manual_payout',
      totalRevenue: distribution.totalRevenue || 0,
      totalCommissions: distribution.totalCommissions || 0,
      platformFee: distribution.platformFee || 0,
      totalAmount: totalAmount || 0,
      affiliatePayments: cleanAffiliatePayments,
      status: 'completed',
      processedAt: Timestamp.now(),
      createdAt: Timestamp.now()
    };

    console.log('🧹 Enregistrement nettoyé avant sauvegarde:', record);

    const docRef = await addDoc(collection(db, 'paymentDistributions'), record);
    console.log('✅ Enregistrement créé:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('❌ Erreur création enregistrement distribution:', error);
    throw error;
  }
};
