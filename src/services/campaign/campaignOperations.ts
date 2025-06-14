
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Campaign } from '@/types';

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
  stripeData: { customerId: string; setupIntentId: string; paymentMethodId?: string }
) => {
  console.log('🔥 FINALIZE: Finalisation de la campagne:', campaignId);
  console.log('🔥 FINALIZE: Données Stripe:', stripeData);
  
  try {
    // Utiliser l'API Vercel pour finaliser via Firebase Admin
    const response = await fetch('/api/finalize-campaign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        campaignId,
        stripeCustomerId: stripeData.customerId,
        stripePaymentMethodId: stripeData.paymentMethodId,
        setupIntentId: stripeData.setupIntentId
      })
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ FINALIZE: Campagne finalisée avec succès via API');
    
    return result;
  } catch (error) {
    console.error('❌ FINALIZE: Erreur lors de la finalisation:', error);
    
    // Fallback: essayer la méthode directe Firebase
    console.log('🔄 FINALIZE: Tentative fallback avec Firebase direct...');
    
    const updateData: {
      isDraft: boolean;
      paymentConfigured: boolean;
      stripeCustomerId: string;
      stripeSetupIntentId: string;
      stripePaymentMethodId?: string;
      updatedAt: any;
    } = {
      isDraft: false,
      paymentConfigured: true,
      stripeCustomerId: stripeData.customerId,
      stripeSetupIntentId: stripeData.setupIntentId,
      updatedAt: serverTimestamp(),
    };

    if (stripeData.paymentMethodId) {
      updateData.stripePaymentMethodId = stripeData.paymentMethodId;
    }

    const campaignRef = doc(db, 'campaigns', campaignId);
    await updateDoc(campaignRef, updateData);
    
    console.log('✅ FINALIZE: Campagne finalisée avec fallback Firebase');
    return { success: true, method: 'fallback' };
  }
};
