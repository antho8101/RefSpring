
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const useTracking = () => {
  const recordClick = async (affiliateId: string, campaignId: string, targetUrl: string) => {
    try {
      const clickData = {
        affiliateId,
        campaignId,
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        referrer: document.referrer || null,
        targetUrl,
        ip: null, // On pourrait ajouter l'IP côté serveur plus tard
      };

      console.log('Recording click:', clickData);
      
      const docRef = await addDoc(collection(db, 'clicks'), clickData);
      console.log('Click recorded with ID:', docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('Error recording click:', error);
      // On ne veut pas bloquer la redirection même si l'enregistrement échoue
      return null;
    }
  };

  const recordConversion = async (affiliateId: string, campaignId: string, amount: number, commission: number) => {
    try {
      const conversionData = {
        affiliateId,
        campaignId,
        amount,
        commission,
        timestamp: new Date(),
        verified: false, // Par défaut, les conversions doivent être vérifiées
      };

      console.log('Recording conversion:', conversionData);
      
      const docRef = await addDoc(collection(db, 'conversions'), conversionData);
      console.log('Conversion recorded with ID:', docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('Error recording conversion:', error);
      return null;
    }
  };

  return {
    recordClick,
    recordConversion,
  };
};
