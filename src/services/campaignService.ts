
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Campaign } from '@/types';

// Simplified interface for the payment methods view
export interface CampaignSummary {
  id: string;
  name: string;
  isActive: boolean;
  paymentMethodId?: string;
}

export const campaignService = {
  async getCampaigns(userId: string): Promise<CampaignSummary[]> {
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
    }) as CampaignSummary[];
    
    console.log('✅ Campagnes chargées:', campaignsData.length);
    return campaignsData;
  }
};

// Campaign operations functions
export const createCampaignInFirestore = async (
  campaignData: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'userId'>,
  userId: string
) => {
  console.log('🆕 Création de campagne dans Firestore pour:', userId);
  
  const docRef = await addDoc(collection(db, 'campaigns'), {
    ...campaignData,
    userId,
    isDraft: true,
    paymentConfigured: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  
  console.log('✅ Campagne créée avec ID:', docRef.id);
  return docRef.id;
};

export const updateCampaignInFirestore = async (
  campaignId: string,
  updates: Partial<Campaign>
) => {
  console.log('📝 Mise à jour de campagne:', campaignId);
  
  const campaignRef = doc(db, 'campaigns', campaignId);
  await updateDoc(campaignRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
  
  console.log('✅ Campagne mise à jour');
};

export const finalizeCampaignInFirestore = async (
  campaignId: string,
  stripeData: { customerId: string; setupIntentId: string }
) => {
  console.log('🎯 Finalisation de campagne:', campaignId);
  
  const campaignRef = doc(db, 'campaigns', campaignId);
  await updateDoc(campaignRef, {
    isDraft: false,
    paymentConfigured: true,
    stripeCustomerId: stripeData.customerId,
    stripeSetupIntentId: stripeData.setupIntentId,
    updatedAt: serverTimestamp(),
  });
  
  console.log('✅ Campagne finalisée');
};

export const deleteCampaignFromFirestore = async (
  campaignId: string,
  userId: string
) => {
  console.log('🗑️ Suppression de campagne:', campaignId);
  
  // Vérifier que la campagne appartient bien à l'utilisateur
  const campaignsQuery = query(
    collection(db, 'campaigns'),
    where('userId', '==', userId)
  );
  
  const campaignsSnapshot = await getDocs(campaignsQuery);
  const campaign = campaignsSnapshot.docs.find(doc => doc.id === campaignId);
  
  if (!campaign) {
    throw new Error('Campagne non trouvée ou accès non autorisé');
  }
  
  const campaignRef = doc(db, 'campaigns', campaignId);
  await deleteDoc(campaignRef);
  
  console.log('✅ Campagne supprimée');
};
