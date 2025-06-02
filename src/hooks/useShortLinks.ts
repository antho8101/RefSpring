
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
      console.log('Création de lien court pour:', { campaignId, affiliateId, targetUrl });
      
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
        console.log('Lien court existant trouvé:', existingLink.shortCode);
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

      console.log('Nouveau code court généré:', shortCode);

      // Créer le nouveau lien court
      const shortLinkData = {
        shortCode,
        campaignId,
        affiliateId,
        targetUrl,
        createdAt: new Date(),
        clickCount: 0
      };

      const docRef = await addDoc(collection(db, 'shortLinks'), shortLinkData);
      console.log('Lien court créé avec l\'ID:', docRef.id);
      
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
      console.log('Recherche du lien court:', shortCode);
      
      const shortLinksQuery = query(
        collection(db, 'shortLinks'),
        where('shortCode', '==', shortCode)
      );
      
      const snapshot = await getDocs(shortLinksQuery);
      console.log('Résultats de la recherche:', snapshot.size, 'documents trouvés');
      
      if (snapshot.empty) {
        console.log('Aucun lien court trouvé pour le code:', shortCode);
        return null;
      }
      
      const doc = snapshot.docs[0];
      const data = {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      } as ShortLink;
      
      console.log('Données du lien court récupérées:', data);
      return data;
      
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
