import { useState, useCallback } from 'react';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface SuspiciousActivity {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  ip?: string;
  userAgent?: string;
  timestamp: Date;
}

export const useAntifraud = () => {
  const [blacklistedIPs, setBlacklistedIPs] = useState<Set<string>>(new Set());

  // Détection de bots via user-agent
  const detectBot = useCallback((userAgent: string): boolean => {
    const botPatterns = [
      /bot/i, /crawler/i, /spider/i, /scraper/i,
      /facebookexternalhit/i, /twitterbot/i, /linkedinbot/i,
      /googlebot/i, /bingbot/i, /yandexbot/i,
      /headless/i, /phantom/i, /selenium/i, /puppeteer/i,
      /curl/i, /wget/i, /python/i, /java/i, /go-http/i
    ];
    
    return botPatterns.some(pattern => pattern.test(userAgent));
  }, []);

  // Analyse de user-agent suspect
  const analyzeUserAgent = useCallback((userAgent: string): { suspicious: boolean; reason?: string } => {
    if (!userAgent || userAgent.length < 10) {
      return { suspicious: true, reason: 'User-agent trop court ou manquant' };
    }

    if (detectBot(userAgent)) {
      return { suspicious: true, reason: 'User-agent de bot détecté' };
    }

    // Vérifier les user-agents très génériques
    const genericPatterns = [
      /^Mozilla\/5\.0$/,
      /^curl\/[\d\.]+$/,
      /^Python/,
      /^PostmanRuntime/
    ];

    if (genericPatterns.some(pattern => pattern.test(userAgent))) {
      return { suspicious: true, reason: 'User-agent générique suspect' };
    }

    return { suspicious: false };
  }, [detectBot]);

  // Hash IP pour confidentialité
  const hashIP = useCallback((ip: string): string => {
    return btoa(ip).substring(0, 16);
  }, []);

  // Vérifier si une IP est blacklistée
  const isIPBlacklisted = useCallback(async (ip: string): Promise<boolean> => {
    const hashedIP = hashIP(ip);
    
    if (blacklistedIPs.has(hashedIP)) {
      return true;
    }

    try {
      const blacklistQuery = query(
        collection(db, 'blacklistedIPs'),
        where('hashedIP', '==', hashedIP),
        where('active', '==', true)
      );
      
      const snapshot = await getDocs(blacklistQuery);
      const isBlacklisted = !snapshot.empty;
      
      if (isBlacklisted) {
        setBlacklistedIPs(prev => new Set([...prev, hashedIP]));
      }
      
      return isBlacklisted;
    } catch (error) {
      console.error('❌ ANTIFRAUD - Erreur vérification blacklist:', error);
      return false;
    }
  }, [hashIP, blacklistedIPs]);

  // Ajouter une IP à la blacklist
  const addToBlacklist = useCallback(async (ip: string, reason: string): Promise<void> => {
    const hashedIP = hashIP(ip);
    
    try {
      await addDoc(collection(db, 'blacklistedIPs'), {
        hashedIP,
        reason,
        timestamp: new Date(),
        active: true,
        addedBy: 'antifraud-system'
      });
      
      setBlacklistedIPs(prev => new Set([...prev, hashedIP]));
      console.log('🚫 ANTIFRAUD - IP ajoutée à la blacklist:', hashedIP);
    } catch (error) {
      console.error('❌ ANTIFRAUD - Erreur ajout blacklist:', error);
    }
  }, [hashIP]);

  // Vérifier le taux de clics récents
  const checkClickRate = useCallback(async (ip: string, timeWindowMinutes: number = 5): Promise<{ excessive: boolean; count: number }> => {
    const hashedIP = hashIP(ip);
    const startTime = new Date(Date.now() - (timeWindowMinutes * 60 * 1000));
    
    try {
      const clicksQuery = query(
        collection(db, 'clicks'),
        where('ip', '==', hashedIP),
        where('timestamp', '>=', startTime),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      
      const snapshot = await getDocs(clicksQuery);
      const clickCount = snapshot.size;
      
      // Plus de 20 clics en 5 minutes = suspect
      const excessive = clickCount > 20;
      
      if (excessive) {
        console.log(`🚨 ANTIFRAUD - Taux excessif détecté: ${clickCount} clics en ${timeWindowMinutes}min pour IP ${hashedIP}`);
      }
      
      return { excessive, count: clickCount };
    } catch (error) {
      console.error('❌ ANTIFRAUD - Erreur vérification taux:', error);
      return { excessive: false, count: 0 };
    }
  }, [hashIP]);

  // Enregistrer une activité suspecte
  const logSuspiciousActivity = useCallback(async (activity: SuspiciousActivity): Promise<void> => {
    try {
      await addDoc(collection(db, 'suspiciousActivities'), {
        ...activity,
        ip: activity.ip ? hashIP(activity.ip) : null,
        timestamp: new Date()
      });
      
      console.log('🚨 ANTIFRAUD - Activité suspecte enregistrée:', activity.type);
      
      // Auto-blacklist pour activités très suspectes
      if (activity.severity === 'high' && activity.ip) {
        await addToBlacklist(activity.ip, `Auto-blacklist: ${activity.description}`);
      }
    } catch (error) {
      console.error('❌ ANTIFRAUD - Erreur enregistrement activité:', error);
    }
  }, [hashIP, addToBlacklist]);

  // Validation complète anti-fraude
  const validateClick = useCallback(async (data: {
    ip?: string;
    userAgent?: string;
    affiliateId: string;
    campaignId: string;
  }): Promise<{ valid: boolean; reasons: string[] }> => {
    const reasons: string[] = [];
    
    try {
      // 1. Vérifier blacklist IP
      if (data.ip && await isIPBlacklisted(data.ip)) {
        reasons.push('IP blacklistée');
      }
      
      // 2. Analyser user-agent
      if (data.userAgent) {
        const uaAnalysis = analyzeUserAgent(data.userAgent);
        if (uaAnalysis.suspicious) {
          reasons.push(uaAnalysis.reason || 'User-agent suspect');
          
          if (data.ip) {
            await logSuspiciousActivity({
              type: 'suspicious_user_agent',
              severity: 'medium',
              description: uaAnalysis.reason || 'User-agent suspect',
              ip: data.ip,
              userAgent: data.userAgent,
              timestamp: new Date()
            });
          }
        }
      }
      
      // 3. Vérifier taux de clics
      if (data.ip) {
        const clickRate = await checkClickRate(data.ip);
        if (clickRate.excessive) {
          reasons.push(`Trop de clics récents (${clickRate.count})`);
          
          await logSuspiciousActivity({
            type: 'excessive_click_rate',
            severity: 'high',
            description: `${clickRate.count} clics en 5 minutes`,
            ip: data.ip,
            userAgent: data.userAgent,
            timestamp: new Date()
          });
        }
      }
      
      return {
        valid: reasons.length === 0,
        reasons
      };
      
    } catch (error) {
      console.error('❌ ANTIFRAUD - Erreur validation:', error);
      // En cas d'erreur, on laisse passer pour ne pas bloquer le service
      return { valid: true, reasons: [] };
    }
  }, [isIPBlacklisted, analyzeUserAgent, checkClickRate, logSuspiciousActivity]);

  return {
    detectBot,
    analyzeUserAgent,
    isIPBlacklisted,
    addToBlacklist,
    checkClickRate,
    logSuspiciousActivity,
    validateClick,
    hashIP
  };
};
