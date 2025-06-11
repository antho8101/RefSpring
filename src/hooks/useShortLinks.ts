
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
    // Générer un code plus long pour éviter les collisions
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) { // Augmenté de 6 à 8 caractères
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const createShortLink = async (campaignId: string, affiliateId: string, targetUrl: string) => {
    setLoading(true);
    
    try {
      console.log('🔧 Début création lien court pour:', { campaignId, affiliateId, targetUrl });
      
      if (!db) {
        throw new Error('Base de données non initialisée');
      }
      
      if (!targetUrl || !campaignId || !affiliateId) {
        throw new Error('Paramètres manquants pour la création du lien court');
      }
      
      // Vérifier s'il existe déjà un lien court pour cette combinaison
      console.log('🔍 Recherche lien existant...');
      const existingQuery = query(
        collection(db, 'shortLinks'),
        where('campaignId', '==', campaignId),
        where('affiliateId', '==', affiliateId),
        where('targetUrl', '==', targetUrl)
      );
      
      const existingSnapshot = await getDocs(existingQuery);
      console.log('🔍 Résultats recherche existant:', existingSnapshot.size, 'documents');
      
      if (!existingSnapshot.empty) {
        const existingLink = existingSnapshot.docs[0].data() as ShortLink;
        console.log('✅ Lien court existant trouvé:', existingLink.shortCode);
        setLoading(false);
        return existingLink.shortCode;
      }

      // Générer un nouveau code court unique
      let shortCode = generateShortCode();
      let isUnique = false;
      let attempts = 0;
      
      console.log('🎲 Génération nouveau code court...');
      while (!isUnique && attempts < 20) { // Augmenté de 10 à 20 tentatives
        attempts++;
        console.log('🎲 Tentative', attempts, '- Code testé:', shortCode);
        
        const codeQuery = query(
          collection(db, 'shortLinks'),
          where('shortCode', '==', shortCode)
        );
        const codeSnapshot = await getDocs(codeQuery);
        
        if (codeSnapshot.empty) {
          isUnique = true;
          console.log('✅ Code unique trouvé:', shortCode);
        } else {
          console.log('❌ Code déjà utilisé, nouveau essai...');
          shortCode = generateShortCode();
        }
      }

      if (!isUnique) {
        throw new Error(`Impossible de générer un code unique après ${attempts} tentatives`);
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

      console.log('💾 DONNÉES À SAUVEGARDER:', shortLinkData);
      const docRef = await addDoc(collection(db, 'shortLinks'), shortLinkData);
      console.log('✅ Lien court créé avec succès - ID:', docRef.id, '- Code:', shortCode);
      
      // Vérification immédiate
      console.log('🔍 Vérification immédiate du lien créé...');
      const verificationData = await getShortLinkData(shortCode);
      if (!verificationData) {
        throw new Error('Échec de la vérification du lien créé');
      }
      
      console.log('✅ Vérification réussie - URL récupérée:', verificationData.targetUrl);
      
      setLoading(false);
      return shortCode;
      
    } catch (error) {
      console.error('❌ Erreur lors de la création du lien court:', error);
      setLoading(false);
      throw error; // Relancer l'erreur au lieu de la masquer
    }
  };

  const getShortLinkData = async (shortCode: string) => {
    try {
      console.log('🔍 Recherche du lien court:', shortCode);
      
      if (!db) {
        throw new Error('Base de données non initialisée');
      }
      
      const shortLinksQuery = query(
        collection(db, 'shortLinks'),
        where('shortCode', '==', shortCode)
      );
      
      console.log('🔍 Exécution de la requête...');
      const snapshot = await getDocs(shortLinksQuery);
      console.log('🔍 Résultats de la recherche:', snapshot.size, 'documents trouvés');
      
      if (snapshot.empty) {
        console.log('❌ Aucun lien court trouvé pour le code:', shortCode);
        return null;
      }
      
      const doc = snapshot.docs[0];
      const data = {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      } as ShortLink;
      
      console.log('✅ Données du lien court récupérées:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du lien court:', error);
      throw error; // Relancer l'erreur pour un meilleur debug
    }
  };

  return {
    createShortLink,
    getShortLinkData,
    loading
  };
};
