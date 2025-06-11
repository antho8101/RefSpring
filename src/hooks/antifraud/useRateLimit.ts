
import { useCallback } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const useRateLimit = () => {
  // Hash IP pour confidentialité
  const hashIP = useCallback((ip: string): string => {
    return btoa(ip).substring(0, 16);
  }, []);

  // 🚨 RATE LIMITING DURCI
  const checkClickRate = useCallback(async (ip: string, timeWindowMinutes: number = 5): Promise<{ 
    excessive: boolean; 
    count: number; 
    severity: 'normal' | 'warning' | 'critical' 
  }> => {
    const hashedIP = hashIP(ip);
    const startTime = new Date(Date.now() - (timeWindowMinutes * 60 * 1000));
    
    try {
      const clicksQuery = query(
        collection(db, 'clicks'),
        where('ip', '==', hashedIP),
        where('timestamp', '>=', startTime),
        orderBy('timestamp', 'desc'),
        limit(100)
      );
      
      const snapshot = await getDocs(clicksQuery);
      const clickCount = snapshot.size;
      
      console.log(`🔍 ANTIFRAUD - Vérification taux: ${clickCount} clics en ${timeWindowMinutes}min pour IP ${hashedIP.substring(0, 8)}...`);
      
      // 🚨 SEUILS DURCIS
      let severity: 'normal' | 'warning' | 'critical' = 'normal';
      let excessive = false;

      if (clickCount >= 10) {
        severity = 'critical';
        excessive = true;
      } else if (clickCount >= 5) {
        severity = 'warning';
        excessive = true;
      } else if (clickCount >= 3) {
        severity = 'warning';
        excessive = false; // Warning mais pas bloquant
      }

      if (excessive) {
        console.log(`🚨 ANTIFRAUD - SEUIL DÉPASSÉ: ${clickCount} clics (sévérité: ${severity})`);
      }
      
      return { excessive, count: clickCount, severity };
    } catch (error) {
      console.error('❌ ANTIFRAUD - Erreur vérification taux:', error);
      return { excessive: false, count: 0, severity: 'normal' };
    }
  }, [hashIP]);

  return {
    checkClickRate,
    hashIP
  };
};
