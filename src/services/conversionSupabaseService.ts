import { supabase } from '@/integrations/supabase/client';

interface ConversionData {
  campaignId: string;
  affiliateId: string;
  amount: number;
  orderId?: string;
  customerEmail?: string;
}

interface ConversionFilters {
  campaignId?: string;
  affiliateId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

class ConversionSupabaseService {

  async trackConversion(conversionData: ConversionData) {
    console.log('🎯 CONVERSION SUPABASE - Enregistrement conversion');
    
    try {
      // Use the public track-conversion function (no auth required)
      const supabaseUrl = "https://wsvhmozduyiftmuuynpi.supabase.co";
      const response = await fetch(`${supabaseUrl}/functions/v1/track-conversion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(conversionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'enregistrement de la conversion');
      }

      const result = await response.json();
      console.log('✅ CONVERSION SUPABASE - Conversion enregistrée:', result.conversion.id);
      return result.conversion;

    } catch (error) {
      console.error('❌ CONVERSION SUPABASE - Erreur:', error);
      throw error;
    }
  }

  async getConversions(filters: ConversionFilters = {}) {
    console.log('📋 CONVERSION SUPABASE - Récupération conversions');
    
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (filters.campaignId) queryParams.set('campaignId', filters.campaignId);
      if (filters.affiliateId) queryParams.set('affiliateId', filters.affiliateId);
      if (filters.status) queryParams.set('status', filters.status);
      if (filters.limit) queryParams.set('limit', filters.limit.toString());
      if (filters.offset) queryParams.set('offset', filters.offset.toString());

      const { data, error } = await supabase.functions.invoke('track-conversion', {
        method: 'GET',
        // Note: query parameters need to be handled in the function
      });

      if (error) {
        console.error('❌ CONVERSION SUPABASE - Erreur récupération:', error);
        throw new Error(error.message || 'Erreur lors de la récupération des conversions');
      }

      console.log('✅ CONVERSION SUPABASE - Conversions trouvées:', data.conversions?.length || 0);
      return {
        conversions: data.conversions || [],
        total: data.total || 0,
        limit: data.limit || 50,
        offset: data.offset || 0,
      };

    } catch (error) {
      console.error('❌ CONVERSION SUPABASE - Erreur:', error);
      return {
        conversions: [],
        total: 0,
        limit: 50,
        offset: 0,
      };
    }
  }

  async calculateCommissions(filters: {
    campaignId?: string;
    period?: 'week' | 'month' | 'quarter' | 'year';
    affiliateId?: string;
  } = {}) {
    console.log('💰 CONVERSION SUPABASE - Calcul commissions');
    
    try {
      const { data, error } = await supabase.functions.invoke('calculate-commissions', {
        body: filters
      });

      if (error) {
        console.error('❌ CONVERSION SUPABASE - Erreur calcul commissions:', error);
        throw new Error(error.message || 'Erreur lors du calcul des commissions');
      }

      console.log('✅ CONVERSION SUPABASE - Commissions calculées:', data.summary);
      return data;

    } catch (error) {
      console.error('❌ CONVERSION SUPABASE - Erreur:', error);
      throw error;
    }
  }

  async getCommissionReport(filters: {
    campaignId?: string;
    startDate?: string;
    endDate?: string;
    format?: string;
  } = {}) {
    console.log('📊 CONVERSION SUPABASE - Génération rapport commissions');
    
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      if (filters.campaignId) queryParams.set('campaignId', filters.campaignId);
      if (filters.startDate) queryParams.set('startDate', filters.startDate);
      if (filters.endDate) queryParams.set('endDate', filters.endDate);
      if (filters.format) queryParams.set('format', filters.format);

      const { data, error } = await supabase.functions.invoke('calculate-commissions', {
        method: 'GET',
        // Note: query parameters need to be handled in the function
      });

      if (error) {
        console.error('❌ CONVERSION SUPABASE - Erreur rapport:', error);
        throw new Error(error.message || 'Erreur lors de la génération du rapport');
      }

      console.log('✅ CONVERSION SUPABASE - Rapport généré');
      return data;

    } catch (error) {
      console.error('❌ CONVERSION SUPABASE - Erreur:', error);
      throw error;
    }
  }

  // Direct Supabase queries for authenticated users
  async getConversionsForUser(userId: string, filters: ConversionFilters = {}) {
    console.log('🔐 CONVERSION SUPABASE - Conversions utilisateur authentifié');
    
    try {
      let query = supabase
        .from('conversions')
        .select(`
          id,
          amount,
          commission,
          status,
          verified,
          created_at,
          updated_at,
          campaigns!inner(id, name, user_id),
          affiliates!inner(id, name, email)
        `)
        .eq('campaigns.user_id', userId);

      // Apply filters
      if (filters.campaignId) {
        query = query.eq('campaign_id', filters.campaignId);
      }
      if (filters.affiliateId) {
        query = query.eq('affiliate_id', filters.affiliateId);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      // Apply pagination
      const limit = filters.limit || 50;
      const offset = filters.offset || 0;
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data: conversions, error, count } = await query;

      if (error) {
        console.error('❌ CONVERSION SUPABASE - Erreur requête directe:', error);
        throw error;
      }

      console.log('✅ CONVERSION SUPABASE - Conversions utilisateur:', conversions?.length || 0);
      return {
        conversions: conversions || [],
        total: count || 0,
        limit,
        offset,
      };

    } catch (error) {
      console.error('❌ CONVERSION SUPABASE - Erreur:', error);
      throw error;
    }
  }
}

export const conversionSupabaseService = new ConversionSupabaseService();