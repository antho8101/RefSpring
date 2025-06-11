
import { useState, useCallback } from 'react';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface SuspiciousActivity {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  ip?: string;
  userAgent?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export const useAntifraud = () => {
  const [blacklistedIPs, setBlacklistedIPs] = useState<Set<string>>(new Set());

  // 🚨 DÉTECTION DE BOTS AVANCÉE
  const detectBot = useCallback((userAgent: string): { isBot: boolean; confidence: number; reasons: string[] } => {
    const reasons: string[] = [];
    let confidence = 0;

    // Patterns de bots évidents
    const criticalBotPatterns = [
      /bot/i, /crawler/i, /spider/i, /scraper/i,
      /headless/i, /phantom/i, /selenium/i, /puppeteer/i,
      /curl/i, /wget/i, /python/i, /java/i, /go-http/i
    ];
    
    if (criticalBotPatterns.some(pattern => pattern.test(userAgent))) {
      confidence += 90;
      reasons.push('Pattern de bot détecté');
    }

    // Patterns suspects (bots qui tentent de se cacher)
    const suspiciousBotPatterns = [
      /facebookexternalhit/i, /twitterbot/i, /linkedinbot/i,
      /googlebot/i, /bingbot/i, /yandexbot/i,
      /postmanruntime/i, /insomnia/i, /httpie/i
    ];

    if (suspiciousBotPatterns.some(pattern => pattern.test(userAgent))) {
      confidence += 70;
      reasons.push('Bot social/search engine détecté');
    }

    // User-agent trop court ou manquant
    if (!userAgent || userAgent.length < 20) {
      confidence += 60;
      reasons.push('User-agent trop court ou manquant');
    }

    // User-agent générique suspect
    const genericPatterns = [
      /^Mozilla\/5\.0$/,
      /^Mozilla\/4\.0$/,
      /^User-Agent$/,
      /^Unknown$/
    ];

    if (genericPatterns.some(pattern => pattern.test(userAgent))) {
      confidence += 50;
      reasons.push('User-agent générique suspect');
    }

    // 🚨 NOUVEAU : Détection de patterns de manipulation
    if (userAgent.includes('RefSpring') || userAgent.includes('tracking')) {
      confidence += 95;
      reasons.push('Tentative de manipulation détectée');
    }

    // Absence de certains headers typiques
    if (!userAgent.includes('Mozilla') && !userAgent.includes('WebKit')) {
      confidence += 40;
      reasons.push('Headers de navigateur manquants');
    }

    return {
      isBot: confidence >= 50,
      confidence,
      reasons
    };
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
  }, []);

  // 🚨 SYSTÈME DE SCORING DE RISQUE AVANCÉ
  const calculateRiskScore = useCallback((data: {
    ip?: string;
    userAgent?: string;
    clickCount?: number;
    timeInterval?: number;
    referrer?: string;
  }): { score: number; factors: string[] } => {
    let score = 0;
    const factors: string[] = [];

    // Analyse du user-agent
    if (data.userAgent) {
      const botAnalysis = detectBot(data.userAgent);
      if (botAnalysis.isBot) {
        score += botAnalysis.confidence;
        factors.push(`Bot détecté (${botAnalysis.confidence}%)`);
      }
    }

    // Analyse du taux de clics
    if (data.clickCount && data.timeInterval) {
      const clicksPerMinute = data.clickCount / (data.timeInterval / 60);
      if (clicksPerMinute > 2) {
        score += 60;
        factors.push(`Taux de clics excessif (${clicksPerMinute.toFixed(1)}/min)`);
      } else if (clicksPerMinute > 1) {
        score += 30;
        factors.push(`Taux de clics suspect (${clicksPerMinute.toFixed(1)}/min)`);
      }
    }

    // Analyse du referrer
    if (!data.referrer || data.referrer === '') {
      score += 20;
      factors.push('Pas de referrer');
    } else if (data.referrer.includes('localhost') || data.referrer.includes('127.0.0.1')) {
      score += 40;
      factors.push('Referrer localhost suspect');
    }

    return { score: Math.min(score, 100), factors };
  }, [detectBot]);

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

  // 🚨 ENREGISTREMENT D'ACTIVITÉ SUSPECTE RENFORCÉ
  const logSuspiciousActivity = useCallback(async (activity: SuspiciousActivity): Promise<void> => {
    try {
      console.log(`🚨 ANTIFRAUD - Activité ${activity.severity}:`, activity.type);
      
      await addDoc(collection(db, 'suspiciousActivities'), {
        ...activity,
        ip: activity.ip ? hashIP(activity.ip) : null,
        timestamp: new Date(),
        investigated: false,
        falsePositive: false
      });
      
      // 🚨 AUTO-BLACKLIST pour activités critiques
      if (activity.severity === 'critical' && activity.ip) {
        await addToBlacklist(activity.ip, `Auto-blacklist: ${activity.description}`, 'critical');
      }
      
      // Auto-blacklist pour activités high répétées
      if (activity.severity === 'high' && activity.ip) {
        // Vérifier si cette IP a déjà eu des activités suspectes
        const recentActivitiesQuery = query(
          collection(db, 'suspiciousActivities'),
          where('ip', '==', hashIP(activity.ip)),
          where('timestamp', '>', new Date(Date.now() - 24 * 60 * 60 * 1000)), // 24h
          limit(10)
        );
        
        const recentActivities = await getDocs(recentActivitiesQuery);
        if (recentActivities.size >= 3) {
          await addToBlacklist(activity.ip, `Auto-blacklist: ${recentActivities.size} activités suspectes en 24h`, 'high');
        }
      }
      
    } catch (error) {
      console.error('❌ ANTIFRAUD - Erreur enregistrement activité:', error);
    }
  }, [hashIP, addToBlacklist]);

  // 🚨 VALIDATION ANTI-FRAUDE COMPLÈTE RENFORCÉE
  const validateClick = useCallback(async (data: {
    ip?: string;
    userAgent?: string;
    affiliateId: string;
    campaignId: string;
    referrer?: string;
  }): Promise<{ valid: boolean; reasons: string[]; riskScore: number }> => {
    const reasons: string[] = [];
    let riskScore = 0;
    
    try {
      console.log('🛡️ ANTIFRAUD - Validation renforcée en cours...');

      // 1. Vérifier blacklist IP (BLOQUANT)
      if (data.ip) {
        const blacklistCheck = await isIPBlacklisted(data.ip);
        if (blacklistCheck.blacklisted) {
          reasons.push(`IP blacklistée: ${blacklistCheck.reason}`);
          riskScore = 100;
          return { valid: false, reasons, riskScore };
        }
      }

      // 2. Analyser user-agent (BLOQUANT si bot évident)
      if (data.userAgent) {
        const botAnalysis = detectBot(data.userAgent);
        riskScore += botAnalysis.confidence;
        
        if (botAnalysis.isBot && botAnalysis.confidence >= 90) {
          reasons.push(...botAnalysis.reasons);
          
          if (data.ip) {
            await logSuspiciousActivity({
              type: 'bot_detection',
              severity: 'critical',
              description: `Bot évident détecté: ${botAnalysis.reasons.join(', ')}`,
              ip: data.ip,
              userAgent: data.userAgent,
              timestamp: new Date(),
              metadata: { confidence: botAnalysis.confidence }
            });
          }
          
          return { valid: false, reasons, riskScore };
        } else if (botAnalysis.isBot) {
          reasons.push(...botAnalysis.reasons);
        }
      }

      // 3. Vérifier taux de clics (BLOQUANT si critique)
      if (data.ip) {
        const clickRate = await checkClickRate(data.ip);
        
        if (clickRate.severity === 'critical') {
          reasons.push(`Trop de clics récents (${clickRate.count})`);
          riskScore += 70;
          
          await logSuspiciousActivity({
            type: 'excessive_click_rate',
            severity: 'critical',
            description: `${clickRate.count} clics en 5 minutes`,
            ip: data.ip,
            userAgent: data.userAgent,
            timestamp: new Date(),
            metadata: { clickCount: clickRate.count }
          });
          
          return { valid: false, reasons, riskScore };
        } else if (clickRate.severity === 'warning') {
          reasons.push(`Taux de clics élevé (${clickRate.count})`);
          riskScore += 30;
        }
      }

      // 4. Calcul du score de risque global
      const riskAnalysis = calculateRiskScore({
        ip: data.ip,
        userAgent: data.userAgent,
        referrer: data.referrer
      });
      
      riskScore = Math.max(riskScore, riskAnalysis.score);
      reasons.push(...riskAnalysis.factors);

      // 5. Décision finale
      const isValid = riskScore < 70; // Seuil durci
      
      console.log(`🛡️ ANTIFRAUD - Résultat: ${isValid ? 'VALIDE' : 'REJETÉ'} (score: ${riskScore})`);
      
      return { valid: isValid, reasons, riskScore };
      
    } catch (error) {
      console.error('❌ ANTIFRAUD - Erreur validation:', error);
      // En cas d'erreur, on bloque par sécurité
      return { valid: false, reasons: ['Erreur système de validation'], riskScore: 100 };
    }
  }, [isIPBlacklisted, detectBot, checkClickRate, calculateRiskScore, logSuspiciousActivity]);

  return {
    detectBot,
    isIPBlacklisted,
    addToBlacklist,
    checkClickRate,
    logSuspiciousActivity,
    validateClick,
    calculateRiskScore,
    hashIP
  };
};
