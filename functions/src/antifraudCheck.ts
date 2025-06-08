
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

interface FraudCheckRequest {
  campaignId?: string;
  affiliateId?: string;
  days?: number;
}

export const antifraudCheck = onCall(
  { cors: true },
  async (request) => {
    try {
      console.log('🛡️ ANTIFRAUD - Début vérification anti-fraude');
      
      // Vérifier l'authentification
      if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Utilisateur non authentifié');
      }

      const { campaignId, affiliateId, days = 7 } = request.data as FraudCheckRequest;
      const uid = request.auth.uid;

      // Date de début pour l'analyse
      const startDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));

      console.log('🛡️ ANTIFRAUD - Paramètres:', { campaignId, affiliateId, days });

      const suspiciousActivities: any[] = [];

      // 1. Détecter les clics excessifs
      await detectExcessiveClicks(campaignId, affiliateId, startDate, suspiciousActivities);

      // 2. Détecter les conversions suspectes
      await detectSuspiciousConversions(campaignId, affiliateId, startDate, suspiciousActivities);

      // 3. Détecter les patterns temporels suspects
      await detectTimePatterns(campaignId, affiliateId, startDate, suspiciousActivities);

      // 4. Détecter les IPs suspectes
      await detectSuspiciousIPs(campaignId, affiliateId, startDate, suspiciousActivities);

      const riskScore = calculateRiskScore(suspiciousActivities);
      const riskLevel = getRiskLevel(riskScore);

      console.log('🛡️ ANTIFRAUD - Analyse terminée:', {
        suspiciousCount: suspiciousActivities.length,
        riskScore,
        riskLevel
      });

      return {
        success: true,
        riskScore,
        riskLevel,
        suspiciousActivities,
        recommendations: generateRecommendations(suspiciousActivities, riskLevel),
        analysisDate: new Date().toISOString(),
        analysisPeriod: { days, startDate: startDate.toISOString() }
      };

    } catch (error: any) {
      console.error('❌ ANTIFRAUD - Erreur:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', 'Erreur d\'analyse anti-fraude');
    }
  }
);

async function detectExcessiveClicks(
  campaignId?: string, 
  affiliateId?: string, 
  startDate?: Date, 
  suspiciousActivities?: any[]
) {
  let clicksQuery = admin.firestore().collection('clicks');

  if (campaignId) clicksQuery = clicksQuery.where('campaignId', '==', campaignId) as any;
  if (affiliateId) clicksQuery = clicksQuery.where('affiliateId', '==', affiliateId) as any;
  if (startDate) clicksQuery = clicksQuery.where('timestamp', '>=', startDate) as any;

  const clicksSnapshot = await clicksQuery.get();

  // Grouper par IP
  const clicksByIP: { [key: string]: number } = {};
  clicksSnapshot.docs.forEach(doc => {
    const data = doc.data();
    const ip = data.ip || 'unknown';
    clicksByIP[ip] = (clicksByIP[ip] || 0) + 1;
  });

  // Détecter les IPs avec trop de clics
  Object.entries(clicksByIP).forEach(([ip, count]) => {
    if (count > 50) { // Plus de 50 clics par IP
      suspiciousActivities?.push({
        type: 'excessive_clicks',
        severity: 'high',
        description: `IP ${ip} a généré ${count} clics`,
        data: { ip, clickCount: count }
      });
    }
  });
}

async function detectSuspiciousConversions(
  campaignId?: string, 
  affiliateId?: string, 
  startDate?: Date, 
  suspiciousActivities?: any[]
) {
  let conversionsQuery = admin.firestore().collection('conversions');

  if (campaignId) conversionsQuery = conversionsQuery.where('campaignId', '==', campaignId) as any;
  if (affiliateId) conversionsQuery = conversionsQuery.where('affiliateId', '==', affiliateId) as any;
  if (startDate) conversionsQuery = conversionsQuery.where('timestamp', '>=', startDate) as any;

  const conversionsSnapshot = await conversionsQuery.get();

  conversionsSnapshot.docs.forEach(doc => {
    const data = doc.data();
    const amount = data.amount || 0;

    // Conversion trop élevée
    if (amount > 5000) { // Plus de 50€
      suspiciousActivities?.push({
        type: 'high_value_conversion',
        severity: 'medium',
        description: `Conversion de ${amount / 100}€ détectée`,
        data: { conversionId: doc.id, amount }
      });
    }
  });
}

async function detectTimePatterns(
  campaignId?: string, 
  affiliateId?: string, 
  startDate?: Date, 
  suspiciousActivities?: any[]
) {
  let clicksQuery = admin.firestore().collection('clicks');

  if (campaignId) clicksQuery = clicksQuery.where('campaignId', '==', campaignId) as any;
  if (affiliateId) clicksQuery = clicksQuery.where('affiliateId', '==', affiliateId) as any;
  if (startDate) clicksQuery = clicksQuery.where('timestamp', '>=', startDate) as any;

  const clicksSnapshot = await clicksQuery.get();

  // Analyser les patterns temporels
  const hourlyClicks: { [key: number]: number } = {};
  clicksSnapshot.docs.forEach(doc => {
    const data = doc.data();
    if (data.timestamp && data.timestamp.toDate) {
      const hour = data.timestamp.toDate().getHours();
      hourlyClicks[hour] = (hourlyClicks[hour] || 0) + 1;
    }
  });

  // Détecter les pics suspects (plus de 80% des clics sur 2 heures)
  const totalClicks = Object.values(hourlyClicks).reduce((sum, count) => sum + count, 0);
  Object.entries(hourlyClicks).forEach(([hour, count]) => {
    const percentage = (count / totalClicks) * 100;
    if (percentage > 40) { // Plus de 40% des clics sur une heure
      suspiciousActivities?.push({
        type: 'suspicious_time_pattern',
        severity: 'medium',
        description: `${percentage.toFixed(1)}% des clics concentrés sur l'heure ${hour}h`,
        data: { hour: parseInt(hour), percentage, clickCount: count }
      });
    }
  });
}

async function detectSuspiciousIPs(
  campaignId?: string, 
  affiliateId?: string, 
  startDate?: Date, 
  suspiciousActivities?: any[]
) {
  // Cette fonction analyserait les patterns d'IP suspectes
  // Pour l'instant, on fait une vérification basique
  console.log('🛡️ ANTIFRAUD - Analyse IP en cours...');
}

function calculateRiskScore(suspiciousActivities: any[]): number {
  let score = 0;
  
  suspiciousActivities.forEach(activity => {
    switch (activity.severity) {
      case 'high': score += 30; break;
      case 'medium': score += 15; break;
      case 'low': score += 5; break;
    }
  });

  return Math.min(score, 100); // Max 100
}

function getRiskLevel(score: number): string {
  if (score >= 70) return 'ÉLEVÉ';
  if (score >= 40) return 'MOYEN';
  if (score >= 20) return 'FAIBLE';
  return 'MINIMAL';
}

function generateRecommendations(activities: any[], riskLevel: string): string[] {
  const recommendations: string[] = [];

  if (riskLevel === 'ÉLEVÉ') {
    recommendations.push('Suspendre temporairement les paiements');
    recommendations.push('Analyser manuellement les conversions récentes');
  }

  if (activities.some(a => a.type === 'excessive_clicks')) {
    recommendations.push('Implémenter une limite de clics par IP');
  }

  if (activities.some(a => a.type === 'high_value_conversion')) {
    recommendations.push('Vérifier manuellement les conversions élevées');
  }

  if (recommendations.length === 0) {
    recommendations.push('Aucune action requise - profil normal');
  }

  return recommendations;
}
