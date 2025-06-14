
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CampaignSummary } from './types';

export const getCampaigns = async (userId: string): Promise<CampaignSummary[]> => {
  console.log('🔍 Chargement des campagnes depuis Firebase pour:', userId);
  
  const campaignsQuery = query(
    collection(db, 'campaigns'),
    where('userId', '==', userId)
  );
  
  const campaignsSnapshot = await getDocs(campaignsQuery);
  
  const campaignsData = campaignsSnapshot.docs.map(doc => {
    const data = doc.data();
    console.log('🎯 Campaign status check:', {
      id: doc.id,
      name: data.name,
      isActive: data.isActive,
      isDraft: data.isDraft,
      paymentConfigured: data.paymentConfigured,
      stripePaymentMethodId: data.stripePaymentMethodId
    });
    
    return {
      id: doc.id,
      name: data.name || 'Campagne sans nom',
      isActive: data.isActive === true,
      // CORRECTION: Utiliser stripePaymentMethodId comme référence de la carte
      paymentMethodId: data.stripePaymentMethodId,
    };
  }) as CampaignSummary[];
  
  console.log('✅ Campagnes chargées avec statuts corrects:', campaignsData.length);
  return campaignsData;
};
