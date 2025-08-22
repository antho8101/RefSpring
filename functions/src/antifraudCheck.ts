import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Types pour l'anti-fraude
interface SuspiciousActivity {
  type: string;
  severity: "low" | "medium" | "high";
  details: string;
  timestamp: Date;
  campaignId?: string;
  affiliateId?: string;
  ip?: string;
}

interface ClickData {
  ip?: string;
  userAgent?: string;
  antifraudFlags?: string[];
  campaignId?: string;
  affiliateId?: string;
  timestamp?: Date;
}

interface AntifraudReport {
  suspiciousActivities: SuspiciousActivity[];
  riskScore: number;
  recommendations: string[];
  summary: {
    totalFlags: number;
    highRiskActivities: number;
    mediumRiskActivities: number;
    lowRiskActivities: number;
  };
}

// Fonction principale d'anti-fraude
export const antifraudCheck = functions.https.onRequest(async (request, response) => {
  response.set("Access-Control-Allow-Origin", "*");
  response.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.set("Access-Control-Allow-Headers", "Content-Type");

  if (request.method === "OPTIONS") {
    response.status(200).end();
    return;
  }

  if (request.method !== "POST") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { campaignId, affiliateId, startDate, endDate } = request.body;

    console.log("🛡️ ANTIFRAUD - Analyse en cours...", {
      campaignId,
      affiliateId,
      startDate,
      endDate,
    });

    const suspiciousActivities: SuspiciousActivity[] = [];

    // Analyser les patterns suspects
    await analyzeClickPatterns(campaignId, affiliateId, startDate ? new Date(startDate) : undefined, suspiciousActivities);
    await analyzeConversionPatterns(campaignId, affiliateId, startDate ? new Date(startDate) : undefined, suspiciousActivities);
    await analyzeTimePatterns(campaignId, affiliateId, startDate ? new Date(startDate) : undefined, suspiciousActivities);
    await analyzeIPPatterns(campaignId, affiliateId, startDate ? new Date(startDate) : undefined, suspiciousActivities);
    await analyzeBotPatterns(campaignId, affiliateId, startDate ? new Date(startDate) : undefined, suspiciousActivities);

    // Calculer le score de risque
    const riskScore = calculateRiskScore(suspiciousActivities);

    // Générer des recommandations
    const recommendations = generateRecommendations(suspiciousActivities, riskScore);

    const report: AntifraudReport = {
      suspiciousActivities,
      riskScore,
      recommendations,
      summary: {
        totalFlags: suspiciousActivities.length,
        highRiskActivities: suspiciousActivities.filter(a => a.severity === "high").length,
        mediumRiskActivities: suspiciousActivities.filter(a => a.severity === "medium").length,
        lowRiskActivities: suspiciousActivities.filter(a => a.severity === "low").length,
      },
    };

    console.log("🛡️ ANTIFRAUD - Analyse terminée", {
      riskScore,
      totalFlags: report.summary.totalFlags,
      highRisk: report.summary.highRiskActivities,
    });

    response.status(200).json(report);
  } catch (error) {
    console.error("🛡️ ANTIFRAUD - Erreur:", error);
    response.status(500).json({ error: "Internal server error" });
  }
});

// Analyser les patterns de clics suspects
async function analyzeClickPatterns(
  campaignId?: string,
  affiliateId?: string,
  startDate?: Date,
  suspiciousActivities?: SuspiciousActivity[]
) {
  let clicksQuery: admin.firestore.Query = admin.firestore().collection("clicks");

  if (campaignId) clicksQuery = clicksQuery.where("campaignId", "==", campaignId);
  if (affiliateId) clicksQuery = clicksQuery.where("affiliateId", "==", affiliateId);
  if (startDate) clicksQuery = clicksQuery.where("timestamp", ">=", startDate);

  const clicksSnapshot = await clicksQuery.get();

  // Analyser les IPs qui cliquent trop souvent
  const ipCounts: { [ip: string]: number } = {};
  const timeWindows: { [ip: string]: Date[] } = {};

  clicksSnapshot.docs.forEach(doc => {
    const data = doc.data() as ClickData;
    const ip = data.ip || "unknown";
    const timestamp = data.timestamp ? new Date(data.timestamp) : new Date();

    ipCounts[ip] = (ipCounts[ip] || 0) + 1;
    if (!timeWindows[ip]) timeWindows[ip] = [];
    timeWindows[ip].push(timestamp);
  });

  // Détecter les IPs suspectes
  Object.entries(ipCounts).forEach(([ip, count]) => {
    if (count > 100) { // Seuil de 100 clics par IP
      suspiciousActivities?.push({
        type: "excessive_clicks_per_ip",
        severity: count > 500 ? "high" : count > 200 ? "medium" : "low",
        details: `IP ${ip} a généré ${count} clics`,
        timestamp: new Date(),
        campaignId,
        affiliateId,
        ip,
      });
    }
  });
}

// Analyser les patterns de conversion suspects
async function analyzeConversionPatterns(
  campaignId?: string,
  affiliateId?: string,
  startDate?: Date,
  suspiciousActivities?: SuspiciousActivity[]
) {
  let conversionsQuery: admin.firestore.Query = admin.firestore().collection("conversions");

  if (campaignId) conversionsQuery = conversionsQuery.where("campaignId", "==", campaignId);
  if (affiliateId) conversionsQuery = conversionsQuery.where("affiliateId", "==", affiliateId);
  if (startDate) conversionsQuery = conversionsQuery.where("timestamp", ">=", startDate);

  const conversionsSnapshot = await conversionsQuery.get();

  // Analyser les taux de conversion anormalement élevés
  const conversionsByAffiliate: { [affiliateId: string]: number } = {};
  const clicksByAffiliate: { [affiliateId: string]: number } = {};

  conversionsSnapshot.docs.forEach(doc => {
    const data = doc.data();
    const affId = data.affiliateId || "unknown";
    conversionsByAffiliate[affId] = (conversionsByAffiliate[affId] || 0) + 1;
  });

  // Calculer les taux de conversion suspects (>20%)
  Object.entries(conversionsByAffiliate).forEach(([affId, conversions]) => {
    const clicks = clicksByAffiliate[affId] || 1;
    const conversionRate = (conversions / clicks) * 100;

    if (conversionRate > 20) {
      suspiciousActivities?.push({
        type: "high_conversion_rate",
        severity: conversionRate > 50 ? "high" : conversionRate > 30 ? "medium" : "low",
        details: `Affilié ${affId} a un taux de conversion de ${conversionRate.toFixed(2)}%`,
        timestamp: new Date(),
        campaignId,
        affiliateId: affId,
      });
    }
  });
}

// Analyser les patterns temporels suspects
async function analyzeTimePatterns(
  campaignId?: string,
  affiliateId?: string,
  startDate?: Date,
  suspiciousActivities?: SuspiciousActivity[]
) {
  let clicksQuery: admin.firestore.Query = admin.firestore().collection("clicks");

  if (campaignId) clicksQuery = clicksQuery.where("campaignId", "==", campaignId);
  if (affiliateId) clicksQuery = clicksQuery.where("affiliateId", "==", affiliateId);
  if (startDate) clicksQuery = clicksQuery.where("timestamp", ">=", startDate);

  const clicksSnapshot = await clicksQuery.get();

  // Analyser les heures de pointe anormales
  const hourCounts: { [hour: number]: number } = {};

  clicksSnapshot.docs.forEach(doc => {
    const data = doc.data() as ClickData;
    const timestamp = data.timestamp ? new Date(data.timestamp) : new Date();
    const hour = timestamp.getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });

  // Détecter les pics d'activité suspects (>3h du matin)
  Object.entries(hourCounts).forEach(([hour, count]) => {
    const h = parseInt(hour);
    if (h >= 2 && h <= 5 && count > 50) { // Activité suspecte entre 2h et 5h
      suspiciousActivities?.push({
        type: "suspicious_time_activity",
        severity: count > 200 ? "high" : count > 100 ? "medium" : "low",
        details: `${count} clics à ${h}h (heure suspecte)`,
        timestamp: new Date(),
        campaignId,
        affiliateId,
      });
    }
  });
}

// Analyser les patterns d'IP suspects (blacklist)
async function analyzeIPPatterns(
  campaignId?: string,
  affiliateId?: string,
  startDate?: Date,
  suspiciousActivities?: SuspiciousActivity[]
) {
  console.log("🛡️ ANTIFRAUD - Analyse IP et blacklist...");
  
  let clicksQuery: admin.firestore.Query = admin.firestore().collection("clicks");
  
  if (campaignId) clicksQuery = clicksQuery.where("campaignId", "==", campaignId);
  if (affiliateId) clicksQuery = clicksQuery.where("affiliateId", "==", affiliateId);
  if (startDate) clicksQuery = clicksQuery.where("timestamp", ">=", startDate);
  
  const clicksSnapshot = await clicksQuery.get();
  
  // Analyser les IPs avec plusieurs incidents
  const suspiciousIPs: { [ip: string]: number } = {};
  
  clicksSnapshot.docs.forEach(doc => {
    const data = doc.data() as ClickData;
    const ip = data.ip || "unknown";
    const hasFlags = data.antifraudFlags && data.antifraudFlags.length > 0;
    
    if (hasFlags) {
      suspiciousIPs[ip] = (suspiciousIPs[ip] || 0) + 1;
    }
  });
  
  // Reporter les IPs avec plusieurs incidents
  Object.entries(suspiciousIPs).forEach(([ip, incidents]) => {
    if (incidents > 3) {
      suspiciousActivities?.push({
        type: "suspicious_ip_multiple_incidents",
        severity: incidents > 10 ? "high" : incidents > 5 ? "medium" : "low",
        details: `IP ${ip} a ${incidents} incidents suspects`,
        timestamp: new Date(),
        campaignId,
        affiliateId,
        ip,
      });
    }
  });
}

// Analyser les patterns de bots suspects
async function analyzeBotPatterns(
  campaignId?: string,
  affiliateId?: string,
  startDate?: Date,
  suspiciousActivities?: SuspiciousActivity[]
) {
  console.log("🛡️ ANTIFRAUD - Détection bots et user-agents...");
  
  let clicksQuery: admin.firestore.Query = admin.firestore().collection("clicks");
  
  if (campaignId) clicksQuery = clicksQuery.where("campaignId", "==", campaignId);
  if (affiliateId) clicksQuery = clicksQuery.where("affiliateId", "==", affiliateId);
  if (startDate) clicksQuery = clicksQuery.where("timestamp", ">=", startDate);
  
  const clicksSnapshot = await clicksQuery.get();
  
  // Patterns de bots connus
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /automation/i,
  ];
  
  const suspiciousBots: { [userAgent: string]: number } = {};
  
  clicksSnapshot.docs.forEach(doc => {
    const data = doc.data() as ClickData;
    const userAgent = data.userAgent || "";
    
    const isSuspiciousBot = botPatterns.some(pattern => pattern.test(userAgent));
    
    if (isSuspiciousBot) {
      suspiciousBots[userAgent] = (suspiciousBots[userAgent] || 0) + 1;
    }
  });
  
  // Reporter les bots suspects
  Object.entries(suspiciousBots).forEach(([userAgent, count]) => {
    if (count > 5) {
      suspiciousActivities?.push({
        type: "suspicious_bot_activity",
        severity: count > 50 ? "high" : count > 20 ? "medium" : "low",
        details: `Bot détecté: ${userAgent} (${count} requêtes)`,
        timestamp: new Date(),
        campaignId,
        affiliateId,
      });
    }
  });
}

// Calculer le score de risque global
function calculateRiskScore(suspiciousActivities: SuspiciousActivity[]): number {
  let score = 0;
  
  suspiciousActivities.forEach(activity => {
    switch (activity.severity) {
    case "high": score += 30; break;
    case "medium": score += 15; break;
    case "low": score += 5; break;
    }
  });
  
  return Math.min(score, 100); // Plafonner à 100
}

// Générer des recommandations
function generateRecommendations(suspiciousActivities: SuspiciousActivity[], riskScore: number): string[] {
  const recommendations: string[] = [];
  
  if (riskScore > 70) {
    recommendations.push("🚨 Risque élevé détecté - Suspendre temporairement la campagne");
    recommendations.push("🔒 Activer la validation manuelle des conversions");
    recommendations.push("🛡️ Renforcer les contrôles anti-fraude");
  } else if (riskScore > 40) {
    recommendations.push("⚠️ Risque modéré - Surveiller de près l'activité");
    recommendations.push("📊 Analyser les patterns suspects identifiés");
    recommendations.push("🔍 Vérifier manuellement les conversions suspectes");
  } else if (riskScore > 20) {
    recommendations.push("✅ Risque faible - Continuer la surveillance");
    recommendations.push("📈 Optimiser les seuils de détection");
  } else {
    recommendations.push("🎉 Aucun risque majeur détecté");
    recommendations.push("💡 Maintenir les contrôles actuels");
  }
  
  // Recommandations spécifiques par type d'activité
  const activityTypes = suspiciousActivities.map(a => a.type);
  
  if (activityTypes.includes("excessive_clicks_per_ip")) {
    recommendations.push("🚫 Considérer le blocage temporaire des IPs suspectes");
    recommendations.push("⏰ Implémenter un rate limiting par IP");
  }
  
  if (activityTypes.includes("high_conversion_rate")) {
    recommendations.push("🔍 Vérifier la qualité du trafic des affiliés performants");
    recommendations.push("📋 Mettre en place des contrôles de qualité renforcés");
  }
  
  if (activityTypes.includes("suspicious_bot_activity")) {
    recommendations.push("🤖 Renforcer la détection de bots");
    recommendations.push("🛡️ Implémenter un CAPTCHA pour les patterns suspects");
  }
  
  return recommendations;
}