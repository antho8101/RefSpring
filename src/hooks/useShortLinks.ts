import { useState, useCallback } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  getDoc, 
  serverTimestamp,
  increment 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface ShortLink {
  id: string;
  shortCode: string;
  campaignId: string;
  affiliateId: string;
  targetUrl: string;
  createdAt: Date;
  clickCount: number;
}

export const useShortLinks = () => {
  const [loading, setLoading] = useState(false);

  const createShortLink = useCallback(async (
    campaignId: string,
    affiliateId: string,
    targetUrl: string
  ): Promise<string | null> => {
    try {
      setLoading(true);
      console.log('🔗 SHORT LINK - Création pour:', { campaignId, affiliateId, targetUrl });

      // Vérifier s'il existe déjà un lien pour cette combinaison
      const existingQuery = query(
        collection(db, 'shortLinks'),
        where('campaignId', '==', campaignId),
        where('affiliateId', '==', affiliateId),
        where('targetUrl', '==', targetUrl)
      );
      
      const existingDocs = await getDocs(existingQuery);
      if (!existingDocs.empty) {
        const existingLink = existingDocs.docs[0].data();
        console.log('✅ SHORT LINK - Lien existant trouvé:', existingLink.shortCode);
        return existingLink.shortCode;
      }

      // Générer un code court unique
      let shortCode: string;
      let isUnique = false;
      let attempts = 0;
      const maxAttempts = 10;

      do {
        shortCode = Math.random().toString(36).substring(2, 8);
        attempts++;

        const checkQuery = query(
          collection(db, 'shortLinks'),
          where('shortCode', '==', shortCode)
        );
        const existingShortCode = await getDocs(checkQuery);
        isUnique = existingShortCode.empty;

        if (attempts >= maxAttempts) {
          console.error('❌ SHORT LINK - Impossible de générer un code unique');
          return null;
        }
      } while (!isUnique);

      // Créer le nouveau lien court
      const shortLinkData = {
        shortCode,
        campaignId,
        affiliateId,
        targetUrl,
        clickCount: 0,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'shortLinks'), shortLinkData);
      console.log('✅ SHORT LINK - Créé avec succès:', shortCode);
      return shortCode;

    } catch (error) {
      console.error('❌ SHORT LINK - Erreur création:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getShortLinkData = useCallback(async (shortCode: string): Promise<ShortLink | null> => {
    try {
      console.log('🔍 SHORT LINK - Récupération pour code:', shortCode);

      const q = query(
        collection(db, 'shortLinks'),
        where('shortCode', '==', shortCode)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        console.log('❌ SHORT LINK - Aucune donnée trouvée pour:', shortCode);
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();

      // Incrémenter le compteur de clics
      await updateDoc(doc.ref, {
        clickCount: increment(1)
      });

      const shortLink: ShortLink = {
        id: doc.id,
        shortCode: data.shortCode,
        campaignId: data.campaignId,
        affiliateId: data.affiliateId,
        targetUrl: data.targetUrl,
        createdAt: data.createdAt?.toDate() || new Date(),
        clickCount: (data.clickCount || 0) + 1,
      };

      console.log('✅ SHORT LINK - Données récupérées:', shortLink);
      return shortLink;

    } catch (error) {
      console.error('❌ SHORT LINK - Erreur récupération:', error);
      return null;
    }
  }, []);

  return {
    createShortLink,
    getShortLinkData,
    loading,
  };
};
