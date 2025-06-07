
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Campaign {
  id: string;
  name: string;
  isActive: boolean;
  paymentMethodId?: string;
}

export const campaignService = {
  async getCampaigns(userId: string): Promise<Campaign[]> {
    console.log('🔍 Chargement des campagnes depuis Firebase pour:', userId);
    
    const campaignsQuery = query(
      collection(db, 'campaigns'),
      where('userId', '==', userId)
    );
    
    const campaignsSnapshot = await getDocs(campaignsQuery);
    
    const campaignsData = campaignsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || 'Campagne sans nom',
        isActive: !data.isDraft && data.paymentConfigured,
        paymentMethodId: data.stripePaymentMethodId,
      };
    }) as Campaign[];
    
    console.log('✅ Campagnes chargées:', campaignsData.length);
    return campaignsData;
  }
};
