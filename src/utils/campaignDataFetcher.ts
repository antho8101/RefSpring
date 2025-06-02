
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const fetchCampaignIds = async (userId: string, campaignId?: string): Promise<string[]> => {
  if (campaignId) {
    console.log('📊 Mode campagne spécifique:', campaignId);
    return [campaignId];
  }

  const campaignsQuery = query(
    collection(db, 'campaigns'),
    where('userId', '==', userId)
  );
  const campaignsSnapshot = await getDocs(campaignsQuery);
  const campaignIds = campaignsSnapshot.docs.map(doc => doc.id);
  console.log('📊 Campagnes trouvées:', campaignIds.length);
  return campaignIds;
};

export const fetchClicksForCampaigns = async (campaignIds: string[]): Promise<any[]> => {
  let allClicks: any[] = [];
  
  for (const cId of campaignIds) {
    try {
      const clicksQuery = query(
        collection(db, 'clicks'),
        where('campaignId', '==', cId)
      );
      const clicksSnapshot = await getDocs(clicksQuery);
      const campaignClicks = clicksSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        campaignId: cId 
      }));
      allClicks = [...allClicks, ...campaignClicks];
      console.log(`📊 Clics pour campagne ${cId}:`, campaignClicks.length);
    } catch (error) {
      console.warn(`⚠️ Erreur lors du chargement des clics pour ${cId}:`, error);
    }
  }
  
  return allClicks;
};

export const fetchConversionsForCampaigns = async (campaignIds: string[]): Promise<any[]> => {
  let allConversions: any[] = [];
  
  for (const cId of campaignIds) {
    try {
      const conversionsQuery = query(
        collection(db, 'conversions'),
        where('campaignId', '==', cId)
      );
      const conversionsSnapshot = await getDocs(conversionsQuery);
      const campaignConversions = conversionsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        campaignId: cId 
      }));
      allConversions = [...allConversions, ...campaignConversions];
      console.log(`📊 Conversions pour campagne ${cId}:`, campaignConversions.length);
    } catch (error) {
      console.warn(`⚠️ Erreur lors du chargement des conversions pour ${cId}:`, error);
    }
  }
  
  return allConversions;
};

export const fetchAffiliatesForCampaigns = async (campaignIds: string[]): Promise<any[]> => {
  let allAffiliates: any[] = [];
  
  for (const cId of campaignIds) {
    try {
      const affiliatesQuery = query(
        collection(db, 'affiliates'),
        where('campaignId', '==', cId)
      );
      const affiliatesSnapshot = await getDocs(affiliatesQuery);
      const campaignAffiliates = affiliatesSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        campaignId: cId 
      }));
      allAffiliates = [...allAffiliates, ...campaignAffiliates];
      console.log(`📊 Affiliés pour campagne ${cId}:`, campaignAffiliates.length);
    } catch (error) {
      console.warn(`⚠️ Erreur lors du chargement des affiliés pour ${cId}:`, error);
    }
  }
  
  return allAffiliates;
};
