
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

interface CampaignData {
  name: string;
  description: string;
  targetUrl: string;
  isActive: boolean;
  defaultCommissionRate: number;
}

export const validateCampaignData = onCall(
  { cors: true },
  async (request) => {
    try {
      console.log('🔍 VALIDATION - Début validation campagne');
      
      // Vérifier l'authentification
      if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Utilisateur non authentifié');
      }

      const uid = request.auth.uid;
      const campaignData = request.data as CampaignData;

      console.log('🔍 VALIDATION - Données reçues:', { uid, campaignData });

      // Validation des données
      const errors: string[] = [];

      if (!campaignData.name || campaignData.name.trim().length < 3) {
        errors.push('Le nom de la campagne doit contenir au moins 3 caractères');
      }

      if (!campaignData.targetUrl || !isValidUrl(campaignData.targetUrl)) {
        errors.push('URL de destination invalide');
      }

      if (campaignData.defaultCommissionRate < 0 || campaignData.defaultCommissionRate > 100) {
        errors.push('Le taux de commission doit être entre 0 et 100%');
      }

      // Vérifier les domaines suspects
      if (campaignData.targetUrl && isSuspiciousDomain(campaignData.targetUrl)) {
        errors.push('Domaine non autorisé');
      }

      // Vérifier le nombre de campagnes existantes
      const userCampaigns = await admin.firestore()
        .collection('campaigns')
        .where('userId', '==', uid)
        .get();

      if (userCampaigns.size >= 50) {
        errors.push('Limite de campagnes atteinte (50 max)');
      }

      if (errors.length > 0) {
        console.log('❌ VALIDATION - Erreurs trouvées:', errors);
        throw new HttpsError('invalid-argument', errors.join(', '));
      }

      console.log('✅ VALIDATION - Campagne validée avec succès');
      
      return {
        valid: true,
        sanitizedData: {
          name: campaignData.name.trim(),
          description: campaignData.description?.trim() || '',
          targetUrl: campaignData.targetUrl.trim(),
          isActive: Boolean(campaignData.isActive),
          defaultCommissionRate: Math.round(campaignData.defaultCommissionRate * 100) / 100,
        }
      };

    } catch (error: unknown) {
      console.error('❌ VALIDATION - Erreur:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', 'Erreur de validation interne');
    }
  }
);

function isValidUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
}

function isSuspiciousDomain(url: string): boolean {
  try {
    const domain = new URL(url).hostname.toLowerCase();
    const blockedDomains = [
      'bit.ly',
      't.co',
      'tinyurl.com',
      'goo.gl',
      'suspicious-site.com'
    ];
    
    return blockedDomains.some(blocked => domain.includes(blocked));
  } catch {
    return true;
  }
}
