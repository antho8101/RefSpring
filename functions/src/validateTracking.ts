
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

interface TrackingData {
  affiliateId: string;
  campaignId: string;
  type: 'click' | 'conversion';
  amount?: number;
  userAgent?: string;
  referrer?: string;
  timestamp?: string;
  clientValidation?: boolean;
}

export const validateTracking = onCall(
  { cors: true },
  async (request) => {
    try {
      console.log('📊 TRACKING - Début validation tracking SÉCURISÉE');
      
      const trackingData = request.data as TrackingData;
      const clientIP = request.rawRequest.ip;
      
      console.log('📊 TRACKING - Données reçues (SÉCURISÉ):', { 
        type: trackingData.type,
        affiliateId: trackingData.affiliateId?.substring(0, 8) + '...',
        campaignId: trackingData.campaignId?.substring(0, 8) + '...',
        amount: trackingData.amount,
        clientIP: clientIP?.substring(0, 10) + '...',
        userAgent: trackingData.userAgent?.substring(0, 50) + '...'
      });

      // 🚨 VALIDATION DES DONNÉES RENFORCÉE
      const errors: string[] = [];
      let riskScore = 0;

      if (!trackingData.affiliateId || !trackingData.campaignId) {
        errors.push('affiliateId et campaignId requis');
        riskScore += 50;
      }

      if (!['click', 'conversion'].includes(trackingData.type)) {
        errors.push('type doit être click ou conversion');
        riskScore += 30;
      }

      // 🚨 VÉRIFICATION CAMPAGNE ACTIVE
      const campaignDoc = await admin.firestore()
        .collection('campaigns')
        .doc(trackingData.campaignId)
        .get();

      if (!campaignDoc.exists) {
        errors.push('Campagne introuvable');
        riskScore += 70;
      } else {
        const campaignData = campaignDoc.data();
        if (!campaignData?.isActive) {
          errors.push('Campagne inactive');
          riskScore += 40;
        }
      }

      // 🚨 VÉRIFICATION AFFILIÉ ACTIF
      const affiliateDoc = await admin.firestore()
        .collection('affiliates')
        .doc(trackingData.affiliateId)
        .get();

      if (!affiliateDoc.exists) {
        errors.push('Affilié introuvable');
        riskScore += 70;
      }

      // 🚨 DÉTECTION ANTI-FRAUDE SERVEUR RENFORCÉE
      const fraudCheck = await performAdvancedFraudCheck(trackingData, clientIP);
      riskScore += fraudCheck.riskScore;
      
      if (fraudCheck.riskScore > 70) {
        errors.push(fraudCheck.reason || 'Score de risque trop élevé');
      }

      // 🚨 DÉCISION FINALE
      const isValid = errors.length === 0 && riskScore < 70;

      if (!isValid) {
        console.log(`❌ TRACKING - Validation ÉCHOUÉE (score: ${riskScore}):`, errors);
        
        // Log l'activité suspecte
        await admin.firestore().collection('suspiciousServerActivities').add({
          type: trackingData.type,
          affiliateId: trackingData.affiliateId,
          campaignId: trackingData.campaignId,
          ip: clientIP ? hashIP(clientIP) : null,
          riskScore,
          errors,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          userAgent: trackingData.userAgent,
          blocked: true
        });
        
        throw new HttpsError('permission-denied', `Validation échouée: ${errors.join(', ')}`);
      }

      // 🚨 ENREGISTREMENT SÉCURISÉ
      const collection = trackingData.type === 'click' ? 'clicks' : 'conversions';
      const eventData = {
        affiliateId: trackingData.affiliateId,
        campaignId: trackingData.campaignId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        userAgent: trackingData.userAgent || '',
        referrer: trackingData.referrer || null,
        ip: clientIP ? hashIP(clientIP) : null,
        validated: true,
        riskScore,
        serverValidated: true,
        fraudChecks: fraudCheck.checks,
        ...(trackingData.type === 'conversion' && {
          amount: trackingData.amount || 0,
          requiresManualReview: riskScore > 50
        }),
      };

      const docRef = await admin.firestore()
        .collection(collection)
        .add(eventData);

      console.log(`✅ TRACKING - ${trackingData.type} SÉCURISÉ enregistré:`, docRef.id);

      return {
        success: true,
        eventId: docRef.id,
        validated: true,
        riskScore,
        requiresReview: riskScore > 50
      };

    } catch (error: unknown) {
      console.error('❌ TRACKING - Erreur SÉCURISÉE:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', 'Erreur de validation serveur sécurisée');
    }
  }
);

// 🚨 DÉTECTION ANTI-FRAUDE AVANCÉE CÔTÉ SERVEUR
async function performAdvancedFraudCheck(data: TrackingData, ip?: string): Promise<{
  valid: boolean; 
  riskScore: number; 
  reason?: string;
  checks: string[];
}> {
  const checks: string[] = [];
  let riskScore = 0;

  try {
    // 1. 🚨 VÉRIFICATION IP RATE LIMITING DURCI
    if (ip) {
      const hashedIP = hashIP(ip);
      
      // Vérifier les clics/conversions récents (dernières 5 minutes)
      const recentEvents = await admin.firestore()
        .collection(data.type === 'click' ? 'clicks' : 'conversions')
        .where('ip', '==', hashedIP)
        .where('timestamp', '>', new Date(Date.now() - 5 * 60 * 1000))
        .get();

      const eventCount = recentEvents.size;
      checks.push(`Rate check: ${eventCount} events in 5min`);

      if (eventCount >= 5) {
        riskScore += 80;
        checks.push('CRITICAL: Rate limit exceeded');
      } else if (eventCount >= 3) {
        riskScore += 50;
        checks.push('WARNING: High rate detected');
      }

      // 🚨 VÉRIFICATION BLACKLIST IP
      const blacklistCheck = await admin.firestore()
        .collection('blacklistedIPs')
        .where('hashedIP', '==', hashedIP)
        .where('active', '==', true)
        .get();

      if (!blacklistCheck.empty) {
        riskScore += 100;
        checks.push('CRITICAL: IP blacklisted');
        return { valid: false, riskScore, reason: 'IP blacklistée', checks };
      }
    }

    // 2. 🚨 ANALYSE USER-AGENT SERVEUR
    if (data.userAgent) {
      const botPatterns = [
        /bot/i, /crawler/i, /spider/i, /scraper/i,
        /headless/i, /phantom/i, /selenium/i, /puppeteer/i,
        /curl/i, /wget/i, /python/i, /java/i, /go-http/i,
        /refspring/i, /tracking/i
      ];
      
      const isSuspiciousBot = botPatterns.some(pattern => pattern.test(data.userAgent));
      if (isSuspiciousBot) {
        riskScore += 90;
        checks.push('CRITICAL: Bot user-agent detected');
      }

      if (data.userAgent.length < 20) {
        riskScore += 40;
        checks.push('WARNING: Short user-agent');
      }
    }

    // 3. 🚨 VÉRIFICATION MONTANT SUSPECT (pour conversions)
    if (data.type === 'conversion' && data.amount) {
      if (data.amount > 100000) { // Plus de 1000€
        riskScore += 60;
        checks.push('WARNING: High conversion amount');
      }
      
      if (data.amount > 500000) { // Plus de 5000€
        riskScore += 90;
        checks.push('CRITICAL: Suspicious conversion amount');
      }
    }

    // 4. 🚨 VÉRIFICATION FRÉQUENCE PAR AFFILIÉ
    const recentAffiliateEvents = await admin.firestore()
      .collection(data.type === 'click' ? 'clicks' : 'conversions')
      .where('affiliateId', '==', data.affiliateId)
      .where('timestamp', '>', new Date(Date.now() - 60 * 60 * 1000)) // 1 heure
      .get();

    if (recentAffiliateEvents.size > 20) {
      riskScore += 50;
      checks.push('WARNING: High affiliate activity');
    }

    checks.push(`Final risk score: ${riskScore}`);
    
    return { 
      valid: riskScore < 70, 
      riskScore, 
      reason: riskScore >= 70 ? 'Risk score too high' : undefined,
      checks 
    };

  } catch (error) {
    console.error('❌ FRAUD CHECK - Erreur:', error);
    checks.push('ERROR: Fraud check failed');
    return { valid: true, riskScore: 0, checks }; // En cas d'erreur, on laisse passer
  }
}

function hashIP(ip: string): string {
  // Hash simple de l'IP pour la confidentialité
  return Buffer.from(ip).toString('base64').substring(0, 16);
}
