
import { useState, useCallback } from 'react';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const useIPBlacklist = () => {
  const [blacklistedIPs, setBlacklistedIPs] = useState<Set<string>>(new Set());

  // Hash IP pour confidentialité
  const hashIP = useCallback((ip: string): string => {
    return btoa(ip).substring(0, 16);
  }, []);

  // 🚨 BLACKLIST AUTOMATIQUE RENFORCÉE
  const addToBlacklist = useCallback(async (ip: string, reason: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'): Promise<void> => {
    const hashedIP = hashIP(ip);
    
    try {
      await addDoc(collection(db, 'blacklistedIPs'), {
        hashedIP,
        reason,
        severity,
        timestamp: new Date(),
        active: true,
        addedBy: 'antifraud-system',
        autoBlacklist: true
      });
      
      setBlacklistedIPs(prev => new Set([...prev, hashedIP]));
      console.log(`🚫 ANTIFRAUD - IP blacklistée (${severity}):`, hashedIP.substring(0, 8) + '...');
    } catch (error) {
      console.error('❌ ANTIFRAUD - Erreur ajout blacklist:', error);
    }
  }, [hashIP]);

  // Vérifier si une IP est blacklistée
  const isIPBlacklisted = useCallback(async (ip: string): Promise<{ blacklisted: boolean; reason?: string }> => {
    const hashedIP = hashIP(ip);
    
    if (blacklistedIPs.has(hashedIP)) {
      return { blacklisted: true, reason: 'Cache local' };
    }

    try {
      const blacklistQuery = query(
        collection(db, 'blacklistedIPs'),
        where('hashedIP', '==', hashedIP),
        where('active', '==', true)
      );
      
      const snapshot = await getDocs(blacklistQuery);
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const data = doc.data();
        setBlacklistedIPs(prev => new Set([...prev, hashedIP]));
        return { blacklisted: true, reason: data.reason };
      }
      
      return { blacklisted: false };
    } catch (error) {
      console.error('❌ ANTIFRAUD - Erreur vérification blacklist:', error);
      return { blacklisted: false };
    }
  }, [hashIP, blacklistedIPs]);

  return {
    addToBlacklist,
    isIPBlacklisted,
    hashIP
  };
};
