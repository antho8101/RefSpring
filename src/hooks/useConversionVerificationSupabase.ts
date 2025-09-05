import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Conversion, ConversionAuditLog, ConversionVerificationQueue, ConversionWebhook } from '@/types';

export const useConversionVerificationSupabase = () => {
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
        affiliate_id: affiliateId,
        campaign_id: campaignId,
        amount,
        commission,
        verified: false,
        status,
        risk_score: riskScore,
        webhook_validated: false,
      };

      const { data, error } = await supabase
        .from('conversions')
        .insert([conversionData])
        .select()
        .single();

      if (error) throw error;

      console.log('✅ CONVERSION - Créée avec ID:', data.id);

      // Créer le log d'audit initial
      await createAuditLog(data.id, 'created', null, conversionData, 'system');

      // Ajouter à la queue de vérification si nécessaire
      if (status === 'suspicious' || amount > 10000) { // Plus de 100€
        await addToVerificationQueue(data.id, campaignId, affiliateId, 'high');
      } else if (amount > 5000) { // Plus de 50€
        await addToVerificationQueue(data.id, campaignId, affiliateId, 'medium');
      }

      return data.id;
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
        conversion_id: conversionId,
        action,
        old_value: oldValue ? JSON.stringify(oldValue) : null,
        new_value: newValue ? JSON.stringify(newValue) : null,
        performed_by: performedBy,
        notes,
        metadata: {}
      };

      const { error } = await supabase
        .from('conversion_audit_logs')
        .insert([auditLog]);

      if (error) throw error;

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
        conversion_id: conversionId,
        campaign_id: campaignId,
        affiliate_id: affiliateId,
        priority,
        status: 'pending' as const,
        retry_count: 0
      };

      const { error } = await supabase
        .from('conversion_verification_queue')
        .insert([queueItem]);

      if (error) throw error;

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
        verified_by: adminId,
        verified_at: new Date().toISOString(),
        verification_notes: notes
      };

      const { error } = await supabase
        .from('conversions')
        .update(updateData)
        .eq('id', conversionId);

      if (error) throw error;
      
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
        conversion_id: conversionId,
        webhook_url: webhookUrl,
        status: response.ok ? 'success' : 'failed',
        response_code: response.status,
        response_body: await response.text(),
        sent_at: new Date().toISOString(),
        received_at: response.ok ? new Date().toISOString() : null,
        retry_count: 0,
        max_retries: 3
      };

      const { error } = await supabase
        .from('conversion_webhooks')
        .insert([webhookRecord]);

      if (error) throw error;

      if (response.ok) {
        // Marquer la conversion comme validée par webhook
        const { error: updateError } = await supabase
          .from('conversions')
          .update({ webhook_validated: true })
          .eq('id', conversionId);

        if (updateError) throw updateError;
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
      let query = supabase
        .from('conversions')
        .select('*')
        .in('status', ['pending', 'suspicious'])
        .order('created_at', { ascending: false })
        .limit(50);

      if (campaignId) {
        query = query.eq('campaign_id', campaignId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(row => ({
        id: row.id,
        affiliateId: row.affiliate_id,
        campaignId: row.campaign_id,
        amount: row.amount,
        commission: row.commission,
        verified: row.verified,
        status: row.status,
        riskScore: row.risk_score,
        webhookValidated: row.webhook_validated,
        verifiedBy: row.verified_by,
        verifiedAt: row.verified_at ? new Date(row.verified_at) : undefined,
        verificationNotes: row.verification_notes,
        timestamp: new Date(row.created_at), // Ajout de timestamp manquant
        auditTrail: [], // Ajout de auditTrail manquant
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
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