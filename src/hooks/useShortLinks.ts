
import { useEffect, useState } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  doc,
  getDoc
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

  const generateShortCode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const createShortLink = async (campaignId: string, affiliateId: string, targetUrl: string) => {
    setLoading(true);
    
    try {
      // Vérifier s'il existe déjà un lien court pour cette combinaison
      const existingQuery = query(
        collection(db, 'shortLinks'),
        where('campaignId', '==', campaignId),
        where('affiliateId', '==', affiliateId),
        where('targetUrl', '==', targetUrl)
      );
      
      const existingSnapshot = await getDocs(existingQuery);
      
      if (!existingSnapshot.empty) {
        const existingLink = existingSnapshot.docs[0].data() as ShortLink;
        setLoading(false);
        return existingLink.shortCode;
      }

      // Générer un nouveau code court unique
      let shortCode = generateShortCode();
      let isUnique = false;
      
      while (!isUnique) {
        const codeQuery = query(
          collection(db, 'shortLinks'),
          where('shortCode', '==', shortCode)
        );
        const codeSnapshot = await getDocs(codeQuery);
        
        if (codeSnapshot.empty) {
          isUnique = true;
        } else {
          shortCode = generateShortCode();
        }
      }

      // Créer le nouveau lien court
      const shortLinkData = {
        shortCode,
        campaignId,
        affiliateId,
        targetUrl,
        createdAt: new Date(),
        clickCount: 0
      };

      await addDoc(collection(db, 'shortLinks'), shortLinkData);
      setLoading(false);
      return shortCode;
      
    } catch (error) {
      console.error('Erreur lors de la création du lien court:', error);
      setLoading(false);
      throw error;
    }
  };

  const getShortLinkData = async (shortCode: string) => {
    try {
      const shortLinksQuery = query(
        collection(db, 'shortLinks'),
        where('shortCode', '==', shortCode)
      );
      
      const snapshot = await getDocs(shortLinksQuery);
      
      if (snapshot.empty) {
        return null;
      }
      
      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      } as ShortLink;
      
    } catch (error) {
      console.error('Erreur lors de la récupération du lien court:', error);
      return null;
    }
  };

  return {
    createShortLink,
    getShortLinkData,
    loading
  };
};
