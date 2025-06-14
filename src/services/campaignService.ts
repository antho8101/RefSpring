
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
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

// 🗑️ NOUVELLE FONCTION : Suppression en cascade de tous les documents associés
export const deleteCampaignCascade = async (campaignId: string, userId: string) => {
  console.log('🗑️ CASCADE: Début suppression en cascade pour campagne:', campaignId);
  
  try {
    // 1. Vérifier que la campagne appartient bien à l'utilisateur
    const campaignsQuery = query(
      collection(db, 'campaigns'),
      where('userId', '==', userId)
    );
    
    const campaignsSnapshot = await getDocs(campaignsQuery);
    const campaign = campaignsSnapshot.docs.find(doc => doc.id === campaignId);
    
    if (!campaign) {
      throw new Error('Campagne non trouvée ou accès non autorisé');
    }

    const batch = writeBatch(db);

    // 2. Supprimer tous les affiliés associés
    console.log('🗑️ CASCADE: Suppression des affiliés...');
    const affiliatesQuery = query(
      collection(db, 'affiliates'),
      where('campaignId', '==', campaignId)
    );
    const affiliatesSnapshot = await getDocs(affiliatesQuery);
    
    affiliatesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    console.log(`🗑️ CASCADE: ${affiliatesSnapshot.docs.length} affiliés à supprimer`);

    // 3. Supprimer toutes les conversions associées
    console.log('🗑️ CASCADE: Suppression des conversions...');
    const conversionsQuery = query(
      collection(db, 'conversions'),
      where('campaignId', '==', campaignId)
    );
    const conversionsSnapshot = await getDocs(conversionsQuery);
    
    conversionsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    console.log(`🗑️ CASCADE: ${conversionsSnapshot.docs.length} conversions à supprimer`);

    // 4. Supprimer tous les clics associés
    console.log('🗑️ CASCADE: Suppression des clics...');
    const clicksQuery = query(
      collection(db, 'clicks'),
      where('campaignId', '==', campaignId)
    );
    const clicksSnapshot = await getDocs(clicksQuery);
    
    clicksSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    console.log(`🗑️ CASCADE: ${clicksSnapshot.docs.length} clics à supprimer`);

    // 5. Supprimer les distributions de paiement associées
    console.log('🗑️ CASCADE: Suppression des distributions de paiement...');
    const paymentsQuery = query(
      collection(db, 'paymentDistributions'),
      where('campaignId', '==', campaignId)
    );
    const paymentsSnapshot = await getDocs(paymentsQuery);
    
    paymentsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    console.log(`🗑️ CASCADE: ${paymentsSnapshot.docs.length} distributions de paiement à supprimer`);

    // 6. Supprimer les liens courts associés (si collection existe)
    console.log('🗑️ CASCADE: Suppression des liens courts...');
    const shortLinksQuery = query(
      collection(db, 'shortLinks'),
      where('campaignId', '==', campaignId)
    );
    const shortLinksSnapshot = await getDocs(shortLinksQuery);
    
    shortLinksSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    console.log(`🗑️ CASCADE: ${shortLinksSnapshot.docs.length} liens courts à supprimer`);

    // 7. ENFIN, supprimer la campagne elle-même
    console.log('🗑️ CASCADE: Suppression de la campagne...');
    const campaignRef = doc(db, 'campaigns', campaignId);
    batch.delete(campaignRef);

    // 8. Exécuter toutes les suppressions en une seule transaction
    console.log('🗑️ CASCADE: Exécution de la transaction de suppression...');
    await batch.commit();

    console.log('✅ CASCADE: Suppression en cascade terminée avec succès');
    
    return {
      success: true,
      deleted: {
        affiliates: affiliatesSnapshot.docs.length,
        conversions: conversionsSnapshot.docs.length,
        clicks: clicksSnapshot.docs.length,
        payments: paymentsSnapshot.docs.length,
        shortLinks: shortLinksSnapshot.docs.length,
        campaign: 1
      }
    };

  } catch (error) {
    console.error('❌ CASCADE: Erreur lors de la suppression en cascade:', error);
    throw error;
  }
};

export const deleteCampaignFromFirestore = async (
  campaignId: string,
  userId: string
) => {
  console.log('🗑️ Suppression de campagne avec nettoyage en cascade:', campaignId);
  
  // Utiliser la nouvelle fonction de suppression en cascade
  return deleteCampaignCascade(campaignId, userId);
};
