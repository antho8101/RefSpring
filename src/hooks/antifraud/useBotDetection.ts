
import { useCallback } from 'react';

export const useBotDetection = () => {
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

  return {
    detectBot
  };
};
