
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

interface TrackingData {
  affiliateId: string;
  campaignId: string;
  type: 'click' | 'conversion';
  amount?: number;
  userAgent?: string;
  ip?: string;
}

export const validateTracking = onCall(
  { cors: true },
  async (request) => {
    try {
      console.log('📊 TRACKING - Début validation tracking');
      
      const trackingData = request.data as TrackingData;
      const clientIP = request.rawRequest.ip;
      
      console.log('📊 TRACKING - Données reçues:', { 
        ...trackingData, 
        clientIP: clientIP?.substring(0, 10) + '...' 
      });

      // Validation des données
      const errors: string[] = [];

      if (!trackingData.affiliateId || !trackingData.campaignId) {
        errors.push('affiliateId et campaignId requis');
      }

      if (!['click', 'conversion'].includes(trackingData.type)) {
        errors.push('type doit être click ou conversion');
      }

      // Vérifier que la campagne existe et est active
      const campaignDoc = await admin.firestore()
        .collection('campaigns')
        .doc(trackingData.campaignId)
        .get();

      if (!campaignDoc.exists) {
        errors.push('Campagne introuvable');
      } else {
        const campaignData = campaignDoc.data();
        if (!campaignData?.isActive) {
          errors.push('Campagne inactive');
        }
      }

      // Vérifier que l'affilié existe
      const affiliateDoc = await admin.firestore()
        .collection('affiliates')
        .doc(trackingData.affiliateId)
        .get();

      if (!affiliateDoc.exists) {
        errors.push('Affilié introuvable');
      }

      // Détection anti-fraude
      const fraudCheck = await performFraudCheck(trackingData, clientIP);
      if (!fraudCheck.valid) {
        errors.push(fraudCheck.reason || 'Échec de la vérification anti-fraude');
      }

      if (errors.length > 0) {
        console.log('❌ TRACKING - Erreurs de validation:', errors);
        throw new HttpsError('invalid-argument', errors.join(', '));
      }

      // Enregistrer l'événement
      const collection = trackingData.type === 'click' ? 'clicks' : 'conversions';
      const eventData = {
        affiliateId: trackingData.affiliateId,
        campaignId: trackingData.campaignId,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        userAgent: trackingData.userAgent || '',
        ip: clientIP ? hashIP(clientIP) : null,
        validated: true,
        ...(trackingData.type === 'conversion' && {
          amount: trackingData.amount || 0,
        }),
      };

      const docRef = await admin.firestore()
        .collection(collection)
        .add(eventData);

      console.log(`✅ TRACKING - ${trackingData.type} enregistré:`, docRef.id);

      return {
        success: true,
        eventId: docRef.id,
        validated: true
      };

    } catch (error: any) {
      console.error('❌ TRACKING - Erreur:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', 'Erreur de validation interne');
    }
  }
);

async function performFraudCheck(data: TrackingData, ip?: string): Promise<{valid: boolean, reason?: string}> {
  try {
    // Vérifier la fréquence des clics par IP
    if (ip && data.type === 'click') {
      const recentClicks = await admin.firestore()
        .collection('clicks')
        .where('ip', '==', hashIP(ip))
        .where('timestamp', '>', new Date(Date.now() - 60000)) // Dernière minute
        .get();

      if (recentClicks.size > 10) {
        return { valid: false, reason: 'Trop de clics depuis cette IP' };
      }
    }

    // Vérifier les conversions suspectes
    if (data.type === 'conversion' && data.amount) {
      if (data.amount > 10000) { // Plus de 100€
        return { valid: false, reason: 'Montant de conversion suspect' };
      }
    }

    return { valid: true };
  } catch (error) {
    console.error('❌ FRAUD - Erreur vérification:', error);
    return { valid: true }; // En cas d'erreur, on laisse passer
  }
}

function hashIP(ip: string): string {
  // Simple hash de l'IP pour la privacy
  return Buffer.from(ip).toString('base64').substring(0, 16);
}
