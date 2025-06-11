
import { useCallback } from 'react';
import { useBotDetection } from './antifraud/useBotDetection';
import { useRateLimit } from './antifraud/useRateLimit';
import { useIPBlacklist } from './antifraud/useIPBlacklist';
import { useRiskScoring } from './antifraud/useRiskScoring';
import { useSuspiciousActivity } from './antifraud/useSuspiciousActivity';

export const useAntifraud = () => {
  const { detectBot } = useBotDetection();
  const { checkClickRate, hashIP } = useRateLimit();
  const { addToBlacklist, isIPBlacklisted } = useIPBlacklist();
  const { calculateRiskScore } = useRiskScoring();
  const { logSuspiciousActivity } = useSuspiciousActivity();

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
