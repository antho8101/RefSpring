
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
