
import { useState, useCallback } from 'react';
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Conversion, ConversionAuditLog, ConversionVerificationQueue, ConversionWebhook } from '@/types';

export const useConversionVerification = () => {
  const [loading, setLoading] = useState(false);

  // Créer une conversion avec statut pending
  const createConversion = useCallback(async (
    affiliateId: string,
    campaignId: string,
    amount: number,
    commission: number,
    metadata?: Record<string, any>
  ) => {
    try {
      setLoading(true);
      console.log('💰 CONVERSION - Création avec vérification:', { affiliateId, campaignId, amount });

      // Calculer le score de risque initial
      const riskScore = calculateInitialRiskScore(amount, metadata);
      const status = riskScore > 70 ? 'suspicious' : 'pending';

      const conversionData = {
        affiliateId,
        campaignId,
        amount,
        commission,
        timestamp: serverTimestamp(),
        verified: false,
        status,
        riskScore,
        webhookValidated: false,
        auditTrail: []
      };

      const docRef = await addDoc(collection(db, 'conversions'), conversionData);
      console.log('✅ CONVERSION - Créée avec ID:', docRef.id);

      // Créer le log d'audit initial
      await createAuditLog(docRef.id, 'created', null, conversionData, 'system');

      // Ajouter à la queue de vérification si nécessaire
      if (status === 'suspicious' || amount > 10000) { // Plus de 100€
        await addToVerificationQueue(docRef.id, campaignId, affiliateId, 'high');
      } else if (amount > 5000) { // Plus de 50€
        await addToVerificationQueue(docRef.id, campaignId, affiliateId, 'medium');
      }

      return docRef.id;
    } catch (error) {
      console.error('❌ CONVERSION - Erreur création:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculer le score de risque initial
  const calculateInitialRiskScore = useCallback((amount: number, metadata?: Record<string, any>): number => {
    let score = 0;

    // Score basé sur le montant
    if (amount > 50000) score += 40; // Plus de 500€
    else if (amount > 20000) score += 25; // Plus de 200€
    else if (amount > 10000) score += 15; // Plus de 100€

    // Score basé sur les métadonnées
    if (metadata?.suspicious_ip) score += 20;
    if (metadata?.bot_detected) score += 30;
    if (metadata?.rapid_succession) score += 25;

    return Math.min(score, 100);
  }, []);

  // Créer un log d'audit
  const createAuditLog = useCallback(async (
    conversionId: string,
    action: ConversionAuditLog['action'],
    oldValue: any,
    newValue: any,
    performedBy: string,
    notes?: string
  ) => {
    try {
      const auditLog = {
        conversionId,
        action,
        oldValue: oldValue ? JSON.stringify(oldValue) : null,
        newValue: newValue ? JSON.stringify(newValue) : null,
        performedBy,
        timestamp: serverTimestamp(),
        notes,
        metadata: {}
      };

      await addDoc(collection(db, 'conversionAuditLogs'), auditLog);
      console.log('📝 AUDIT - Log créé:', action);
    } catch (error) {
      console.error('❌ AUDIT - Erreur création log:', error);
    }
  }, []);

  // Ajouter à la queue de vérification
  const addToVerificationQueue = useCallback(async (
    conversionId: string,
    campaignId: string,
    affiliateId: string,
    priority: ConversionVerificationQueue['priority']
  ) => {
    try {
      const queueItem = {
        conversionId,
        campaignId,
        affiliateId,
        priority,
        status: 'pending' as const,
        createdAt: serverTimestamp(),
        retryCount: 0
      };

      await addDoc(collection(db, 'conversionVerificationQueue'), queueItem);
      console.log('📋 QUEUE - Conversion ajoutée avec priorité:', priority);
    } catch (error) {
      console.error('❌ QUEUE - Erreur ajout:', error);
    }
  }, []);

  // Vérifier une conversion (admin)
  const verifyConversion = useCallback(async (
    conversionId: string,
    action: 'verify' | 'reject',
    adminId: string,
    notes?: string
  ) => {
    try {
      setLoading(true);
      console.log('🔍 VERIFICATION - Action:', action, 'pour conversion:', conversionId);

      const newStatus = action === 'verify' ? 'verified' : 'rejected';
      const updateData = {
        status: newStatus,
        verified: action === 'verify',
        verifiedBy: adminId,
        verifiedAt: serverTimestamp(),
        verificationNotes: notes
      };

      await updateDoc(doc(db, 'conversions', conversionId), updateData);
      
      // Créer le log d'audit
      await createAuditLog(conversionId, action === 'verify' ? 'verified' : 'rejected', null, updateData, adminId, notes);

      console.log('✅ VERIFICATION - Conversion', action === 'verify' ? 'approuvée' : 'rejetée');
      return true;
    } catch (error) {
      console.error('❌ VERIFICATION - Erreur:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [createAuditLog]);

  // Envoyer webhook de validation
  const sendVerificationWebhook = useCallback(async (
    conversionId: string,
    webhookUrl: string,
    conversionData: any
  ) => {
    try {
      console.log('🌐 WEBHOOK - Envoi pour conversion:', conversionId);

      const webhookData = {
        conversionId,
        ...conversionData,
        timestamp: new Date().toISOString()
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RefSpring-Webhook': 'conversion-verification'
        },
        body: JSON.stringify(webhookData)
      });

      const webhookRecord = {
        conversionId,
        webhookUrl,
        status: response.ok ? 'success' : 'failed',
        responseCode: response.status,
        responseBody: await response.text(),
        sentAt: serverTimestamp(),
        receivedAt: response.ok ? serverTimestamp() : null,
        retryCount: 0,
        maxRetries: 3
      };

      await addDoc(collection(db, 'conversionWebhooks'), webhookRecord);

      if (response.ok) {
        // Marquer la conversion comme validée par webhook
        await updateDoc(doc(db, 'conversions', conversionId), {
          webhookValidated: true
        });
        console.log('✅ WEBHOOK - Validation réussie');
      } else {
        console.log('❌ WEBHOOK - Échec, code:', response.status);
      }

      return response.ok;
    } catch (error) {
      console.error('❌ WEBHOOK - Erreur envoi:', error);
      return false;
    }
  }, []);

  // Récupérer les conversions en attente de vérification
  const getPendingConversions = useCallback(async (campaignId?: string) => {
    try {
      let conversionsQuery = query(
        collection(db, 'conversions'),
        where('status', 'in', ['pending', 'suspicious']),
        orderBy('timestamp', 'desc'),
        limit(50)
      );

      if (campaignId) {
        conversionsQuery = query(
          collection(db, 'conversions'),
          where('campaignId', '==', campaignId),
          where('status', 'in', ['pending', 'suspicious']),
          orderBy('timestamp', 'desc'),
          limit(50)
        );
      }

      const snapshot = await getDocs(conversionsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate(),
        verifiedAt: doc.data().verifiedAt?.toDate()
      } as Conversion));
    } catch (error) {
      console.error('❌ PENDING - Erreur récupération:', error);
      return [];
    }
  }, []);

  return {
    loading,
    createConversion,
    verifyConversion,
    sendVerificationWebhook,
    getPendingConversions,
    createAuditLog
  };
};
