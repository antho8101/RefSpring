
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

interface QueueProcessRequest {
  forceProcess?: boolean;
  maxItems?: number;
}

export const processConversionQueue = onCall(
  { cors: true },
  async (request) => {
    try {
      console.log('🔄 QUEUE - Début traitement queue de vérification');
      
      // Vérifier l'authentification (optionnel pour les admins)
      if (!request.auth) {
        console.log('⚠️ QUEUE - Traitement automatique sans auth');
      }

      const { forceProcess = false, maxItems = 10 } = request.data as QueueProcessRequest;

      // Récupérer les éléments en attente
      const queueQuery = admin.firestore()
        .collection('conversionVerificationQueue')
        .where('status', '==', 'pending')
        .orderBy('priority', 'desc') // Traiter les priorités hautes en premier
        .orderBy('createdAt', 'asc') // Puis par ordre chronologique
        .limit(maxItems);

      const queueSnapshot = await queueQuery.get();
      
      if (queueSnapshot.empty) {
        console.log('📋 QUEUE - Aucun élément à traiter');
        return {
          success: true,
          processedCount: 0,
          message: 'Aucun élément en queue'
        };
      }

      console.log(`📋 QUEUE - ${queueSnapshot.size} éléments à traiter`);

      let processedCount = 0;
      let errorCount = 0;

      // Traiter chaque élément
      for (const queueDoc of queueSnapshot.docs) {
        try {
          const queueData = queueDoc.data();
          console.log(`🔄 QUEUE - Traitement conversion: ${queueData.conversionId}`);

          // Marquer comme en cours de traitement
          await queueDoc.ref.update({
            status: 'processing',
            processedAt: admin.firestore.FieldValue.serverTimestamp()
          });

          // Récupérer la conversion
          const conversionDoc = await admin.firestore()
            .collection('conversions')
            .doc(queueData.conversionId)
            .get();

          if (!conversionDoc.exists) {
            console.log(`❌ QUEUE - Conversion introuvable: ${queueData.conversionId}`);
            await queueDoc.ref.update({ status: 'failed' });
            errorCount++;
            continue;
          }

          const conversionData = conversionDoc.data();
          
          if (!conversionData) {
            console.error("No conversion data found");
            continue;
          }
          
          // Analyser automatiquement la conversion
          const autoDecision = await analyzeConversionAutomatically(conversionData);
          
          if (autoDecision.action && !forceProcess) {
            // Appliquer la décision automatique
            await admin.firestore()
              .collection('conversions')
              .doc(queueData.conversionId)
              .update({
                status: autoDecision.action === 'approve' ? 'verified' : 'rejected',
                verified: autoDecision.action === 'approve',
                verifiedBy: 'system-auto',
                verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
                verificationNotes: autoDecision.reason
              });

            // Créer le log d'audit
            await admin.firestore()
              .collection('conversionAuditLogs')
              .add({
                conversionId: queueData.conversionId,
                action: autoDecision.action === 'approve' ? 'verified' : 'rejected',
                oldValue: null,
                newValue: JSON.stringify({ status: autoDecision.action === 'approve' ? 'verified' : 'rejected' }),
                performedBy: 'system-auto',
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                notes: autoDecision.reason
              });

            console.log(`✅ QUEUE - Décision automatique: ${autoDecision.action} - ${autoDecision.reason}`);
          } else {
            // Nécessite une vérification manuelle
            await admin.firestore()
              .collection('conversions')
              .doc(queueData.conversionId)
              .update({
                status: 'pending',
                verificationNotes: 'Nécessite une vérification manuelle'
              });

            console.log('👤 QUEUE - Vérification manuelle requise');
          }

          // Marquer l'élément comme traité
          await queueDoc.ref.update({ 
            status: 'completed',
            processedAt: admin.firestore.FieldValue.serverTimestamp()
          });

          processedCount++;

        } catch (error) {
          console.error(`❌ QUEUE - Erreur traitement ${queueDoc.id}:`, error);
          await queueDoc.ref.update({ 
            status: 'failed',
            retryCount: admin.firestore.FieldValue.increment(1)
          });
          errorCount++;
        }
      }

      console.log(`✅ QUEUE - Traitement terminé: ${processedCount} succès, ${errorCount} erreurs`);

      return {
        success: true,
        processedCount,
        errorCount,
        message: `${processedCount} conversions traitées`
      };

    } catch (error: unknown) {
      console.error('❌ QUEUE - Erreur:', error);
      if (error instanceof HttpsError) {
        throw error;
      }
      throw new HttpsError('internal', 'Erreur de traitement de la queue');
    }
  }
);

async function analyzeConversionAutomatically(conversionData: Record<string, unknown>): Promise<{
  action?: 'approve' | 'reject';
  reason: string;
  confidence: number;
}> {
  const amount = conversionData.amount || 0;
  const riskScore = conversionData.riskScore || 0;
  // const timestamp = conversionData.timestamp?.toDate() || new Date();
  
  // Règles automatiques
  
  // 1. Montants très faibles - auto-approuver
  if (amount < 1000) { // Moins de 10€
    return {
      action: 'approve',
      reason: 'Montant faible, risque minimal',
      confidence: 95
    };
  }
  
  // 2. Score de risque très élevé - auto-rejeter
  if (riskScore > 80) {
    return {
      action: 'reject',
      reason: 'Score de risque trop élevé (>80%)',
      confidence: 90
    };
  }
  
  // 3. Montants moyens avec risque faible - auto-approuver
  if (amount < 5000 && riskScore < 30) { // Moins de 50€, risque < 30%
    return {
      action: 'approve',
      reason: 'Montant moyen, risque faible',
      confidence: 85
    };
  }
  
  // 4. Très gros montants - vérification manuelle
  if (amount > 50000) { // Plus de 500€
    return {
      reason: 'Montant élevé nécessitant vérification manuelle',
      confidence: 100
    };
  }
  
  // 5. Score de risque moyen - vérification manuelle
  if (riskScore > 50) {
    return {
      reason: 'Score de risque modéré nécessitant vérification manuelle',
      confidence: 80
    };
  }
  
  // Par défaut - auto-approuver pour les cas normaux
  return {
    action: 'approve',
    reason: 'Conversion standard, aucun flag de risque',
    confidence: 75
  };
}
