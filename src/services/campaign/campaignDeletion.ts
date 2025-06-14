
import { collection, query, where, getDocs, doc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
