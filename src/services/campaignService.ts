
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  updateDoc, 
  deleteDoc, 
  doc,
  getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Campaign } from '@/types';

export const createCampaignInFirestore = async (
  campaignData: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'userId'>,
  userId: string
) => {
  const newCampaign = {
    ...campaignData,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
    paymentConfigured: campaignData.paymentConfigured || false,
    isDraft: campaignData.isDraft || false,
  };

  console.log('Creating campaign:', newCampaign);
  const docRef = await addDoc(collection(db, 'campaigns'), newCampaign);
  console.log('Campaign created with ID:', docRef.id);
  return docRef.id;
};

export const updateCampaignInFirestore = async (id: string, updates: Partial<Campaign>) => {
  const campaignRef = doc(db, 'campaigns', id);
  await updateDoc(campaignRef, {
    ...updates,
    updatedAt: new Date(),
  });
};

export const finalizeCampaignInFirestore = async (
  id: string, 
  stripeData: { customerId: string; setupIntentId: string }
) => {
  const campaignRef = doc(db, 'campaigns', id);
  await updateDoc(campaignRef, {
    isDraft: false,
    paymentConfigured: true,
    stripeCustomerId: stripeData.customerId,
    stripeSetupIntentId: stripeData.setupIntentId,
    updatedAt: new Date(),
  });
  console.log('✅ Campagne finalisée avec succès:', id);
};

export const deleteCampaignFromFirestore = async (campaignId: string, userId: string) => {
  console.log('🗑️ Début suppression campagne:', campaignId);
  console.log('🗑️ User connecté:', userId);
  
  try {
    // 1. Supprimer tous les affiliés de cette campagne
    console.log('🗑️ Suppression des affiliés...');
    const affiliatesQuery = query(
      collection(db, 'affiliates'),
      where('campaignId', '==', campaignId),
      where('userId', '==', userId)
    );
    const affiliatesSnapshot = await getDocs(affiliatesQuery);
    console.log('🗑️ Affiliés trouvés:', affiliatesSnapshot.size);
    
    const deleteAffiliatesPromises = affiliatesSnapshot.docs.map(doc => {
      console.log('🗑️ Suppression affilié:', doc.id);
      return deleteDoc(doc.ref);
    });
    await Promise.all(deleteAffiliatesPromises);
    console.log('✅ Affiliés supprimés avec succès');

    // 2. Supprimer tous les clics de cette campagne
    console.log('🗑️ Suppression des clics...');
    const clicksQuery = query(
      collection(db, 'clicks'),
      where('campaignId', '==', campaignId)
    );
    const clicksSnapshot = await getDocs(clicksQuery);
    console.log('🗑️ Clics trouvés:', clicksSnapshot.size);
    
    const deleteClicksPromises = clicksSnapshot.docs.map(doc => {
      console.log('🗑️ Suppression clic:', doc.id);
      return deleteDoc(doc.ref);
    });
    await Promise.all(deleteClicksPromises);
    console.log('✅ Clics supprimés avec succès');

    // 3. Supprimer tous les liens courts de cette campagne
    console.log('🗑️ Suppression des liens courts...');
    const shortLinksQuery = query(
      collection(db, 'shortLinks'),
      where('campaignId', '==', campaignId)
    );
    const shortLinksSnapshot = await getDocs(shortLinksQuery);
    console.log('🗑️ Liens courts trouvés:', shortLinksSnapshot.size);
    
    const deleteShortLinksPromises = shortLinksSnapshot.docs.map(doc => {
      console.log('🗑️ Suppression lien court:', doc.id);
      return deleteDoc(doc.ref);
    });
    await Promise.all(deleteShortLinksPromises);
    console.log('✅ Liens courts supprimés avec succès');

    // 4. Supprimer toutes les conversions de cette campagne
    console.log('🗑️ Suppression des conversions...');
    const conversionsQuery = query(
      collection(db, 'conversions'),
      where('campaignId', '==', campaignId)
    );
    const conversionsSnapshot = await getDocs(conversionsQuery);
    console.log('🗑️ Conversions trouvées:', conversionsSnapshot.size);
    
    const deleteConversionsPromises = conversionsSnapshot.docs.map(doc => {
      console.log('🗑️ Suppression conversion:', doc.id);
      return deleteDoc(doc.ref);
    });
    await Promise.all(deleteConversionsPromises);
    console.log('✅ Conversions supprimées avec succès');

    // 5. Finalement, supprimer la campagne elle-même
    console.log('🗑️ Suppression de la campagne...');
    const campaignRef = doc(db, 'campaigns', campaignId);
    await deleteDoc(campaignRef);
    
    console.log('✅ Suppression complète terminée pour la campagne:', campaignId);
    
  } catch (error) {
    console.error('❌ Erreur lors de la suppression en cascade:', error);
    console.error('❌ Détails de l\'erreur:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw error;
  }
};
