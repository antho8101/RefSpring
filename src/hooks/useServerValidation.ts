
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { useCallback } from 'react';

interface ServerValidationRequest {
  affiliateId: string;
  campaignId: string;
  type: 'click' | 'conversion';
  amount?: number;
  userAgent?: string;
  referrer?: string;
}

interface ServerValidationResponse {
  valid: boolean;
  riskScore: number;
  reasons: string[];
  eventId?: string;
  blocked: boolean;
}

export const useServerValidation = () => {
  
  // 🚨 VALIDATION CÔTÉ SERVEUR (Firebase Functions)
  const validateWithServer = useCallback(async (request: ServerValidationRequest): Promise<ServerValidationResponse> => {
    try {
      console.log('🛡️ SERVER VALIDATION - Envoi vers Firebase Functions...');
      
      // Utiliser la fonction Firebase existante mais avec validation renforcée
      const validateTracking = httpsCallable(functions, 'validateTracking');
      
      const result = await validateTracking({
        affiliateId: request.affiliateId,
        campaignId: request.campaignId,
        type: request.type,
        amount: request.amount,
        userAgent: request.userAgent,
        referrer: request.referrer,
        timestamp: new Date().toISOString(),
        clientValidation: true
      });
      
      const data = result.data as any;
      
      console.log('✅ SERVER VALIDATION - Réponse reçue:', {
        valid: data.success,
        eventId: data.eventId
      });
      
      return {
        valid: data.success || false,
        riskScore: data.riskScore || 0,
        reasons: data.reasons || [],
        eventId: data.eventId,
        blocked: !data.success
      };
      
    } catch (error: any) {
      console.error('❌ SERVER VALIDATION - Erreur:', error);
      
      // En cas d'erreur serveur, on bloque par sécurité
      return {
        valid: false,
        riskScore: 100,
        reasons: [`Erreur serveur: ${error.message}`],
        blocked: true
      };
    }
  }, []);

  // 🚨 VALIDATION DOUBLE (Client + Serveur)
  const validateEvent = useCallback(async (request: ServerValidationRequest): Promise<{
    allowed: boolean;
    riskScore: number;
    reasons: string[];
    eventId?: string;
  }> => {
    try {
      console.log('🔒 DOUBLE VALIDATION - Début (client + serveur)');
      
      // 1. Validation côté serveur
      const serverResult = await validateWithServer(request);
      
      if (!serverResult.valid) {
        console.log('🚫 DOUBLE VALIDATION - Rejeté par le serveur');
        return {
          allowed: false,
          riskScore: serverResult.riskScore,
          reasons: serverResult.reasons,
        };
      }
      
      console.log('✅ DOUBLE VALIDATION - Validé par le serveur');
      
      return {
        allowed: true,
        riskScore: serverResult.riskScore,
        reasons: serverResult.reasons,
        eventId: serverResult.eventId
      };
      
    } catch (error: any) {
      console.error('❌ DOUBLE VALIDATION - Erreur:', error);
      
      return {
        allowed: false,
        riskScore: 100,
        reasons: [`Erreur validation: ${error.message}`]
      };
    }
  }, [validateWithServer]);

  return {
    validateWithServer,
    validateEvent
  };
};
