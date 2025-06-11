
import { useCallback } from 'react';
import { useBotDetection } from './useBotDetection';

export const useRiskScoring = () => {
  const { detectBot } = useBotDetection();

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

  return {
    calculateRiskScore
  };
};
