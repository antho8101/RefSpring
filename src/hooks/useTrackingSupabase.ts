import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface TrackingData {
  affiliateId: string;
  campaignId: string;
  userAgent?: string;
  referrer?: string;
  ipAddress?: string;
}

export const useTrackingSupabase = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const trackClick = useCallback(async (data: TrackingData) => {
    try {
      setLoading(true);
      
      console.log('📊 SUPABASE: Tracking click', data);

      const { error } = await supabase
        .from('clicks')
        .insert({
          affiliate_id: data.affiliateId,
          campaign_id: data.campaignId,
          user_agent: data.userAgent,
          referrer: data.referrer
        });

      if (error) {
        console.error('❌ Erreur tracking click:', error);
        throw error;
      }

      console.log('✅ Click tracké avec succès');

    } catch (error) {
      console.error('❌ Erreur tracking:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const trackConversion = useCallback(async (data: {
    affiliateId: string;
    campaignId: string;
    amount: number;
    commission: number;
    orderId?: string;
  }) => {
    try {
      setLoading(true);
      
      console.log('💰 SUPABASE: Tracking conversion', data);

      const { error } = await supabase
        .from('conversions')
        .insert({
          affiliate_id: data.affiliateId,
          campaign_id: data.campaignId,
          amount: data.amount,
          commission: data.commission,
          status: 'pending',
          verified: false
        });

      if (error) {
        console.error('❌ Erreur tracking conversion:', error);
        throw error;
      }

      console.log('✅ Conversion trackée avec succès');

    } catch (error) {
      console.error('❌ Erreur tracking conversion:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCampaignById = useCallback(async (campaignId: string) => {
    try {
      console.log('🔍 SUPABASE: Récupération campagne', campaignId);

      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .maybeSingle();

      if (error) {
        console.error('❌ Erreur récupération campagne:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Erreur getCampaignById:', error);
      throw error;
    }
  }, []);

  return {
    trackClick,
    trackConversion,
    getCampaignById,
    loading
  };
};