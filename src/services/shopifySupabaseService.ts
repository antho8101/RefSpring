import { supabase } from '@/integrations/supabase/client';

interface ShopifyAuthUrlData {
  shop: string;
  campaignId: string;
}

interface ShopifyTokenExchangeData {
  code: string;
  state: string;
  shop: string;
}

class ShopifySupabaseService {

  async createAuthUrl(data: ShopifyAuthUrlData) {
    console.log('🛍️ SHOPIFY SUPABASE - Création URL d\'autorisation');
    
    try {
      const { data: result, error } = await supabase.functions.invoke('shopify-oauth', {
        method: 'POST',
        body: data
      });

      if (error) {
        console.error('❌ SHOPIFY SUPABASE - Erreur création URL:', error);
        throw new Error(error.message || 'Erreur lors de la création de l\'URL d\'autorisation');
      }

      console.log('✅ SHOPIFY SUPABASE - URL d\'autorisation créée');
      return {
        authUrl: result.authUrl,
        stateToken: result.stateToken,
        shopDomain: result.shopDomain
      };

    } catch (error) {
      console.error('❌ SHOPIFY SUPABASE - Erreur:', error);
      throw error;
    }
  }

  async exchangeToken(data: ShopifyTokenExchangeData) {
    console.log('🛍️ SHOPIFY SUPABASE - Échange de token');
    
    try {
      const { data: result, error } = await supabase.functions.invoke('shopify-oauth', {
        method: 'PUT',
        body: data
      });

      if (error) {
        console.error('❌ SHOPIFY SUPABASE - Erreur échange token:', error);
        throw new Error(error.message || 'Erreur lors de l\'échange du token');
      }

      console.log('✅ SHOPIFY SUPABASE - Token échangé avec succès');
      return result.integration;

    } catch (error) {
      console.error('❌ SHOPIFY SUPABASE - Erreur:', error);
      throw error;
    }
  }

  async getIntegrations() {
    console.log('🛍️ SHOPIFY SUPABASE - Récupération intégrations');
    
    try {
      const { data: integrations, error } = await supabase
        .from('shopify_integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ SHOPIFY SUPABASE - Erreur récupération:', error);
        throw error;
      }

      console.log('✅ SHOPIFY SUPABASE - Intégrations trouvées:', integrations?.length || 0);
      return integrations || [];

    } catch (error) {
      console.error('❌ SHOPIFY SUPABASE - Erreur:', error);
      return [];
    }
  }

  async updateIntegration(id: string, updates: any) {
    console.log('🛍️ SHOPIFY SUPABASE - Mise à jour intégration:', id);
    
    try {
      const { data: integration, error } = await supabase
        .from('shopify_integrations')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ SHOPIFY SUPABASE - Erreur mise à jour:', error);
        throw error;
      }

      console.log('✅ SHOPIFY SUPABASE - Intégration mise à jour');
      return integration;

    } catch (error) {
      console.error('❌ SHOPIFY SUPABASE - Erreur:', error);
      throw error;
    }
  }

  async deleteIntegration(id: string) {
    console.log('🛍️ SHOPIFY SUPABASE - Suppression intégration:', id);
    
    try {
      const { error } = await supabase
        .from('shopify_integrations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ SHOPIFY SUPABASE - Erreur suppression:', error);
        throw error;
      }

      console.log('✅ SHOPIFY SUPABASE - Intégration supprimée');

    } catch (error) {
      console.error('❌ SHOPIFY SUPABASE - Erreur:', error);
      throw error;
    }
  }

  async getIntegrationByCampaign(campaignId: string) {
    console.log('🛍️ SHOPIFY SUPABASE - Récupération intégration par campagne:', campaignId);
    
    try {
      const { data: integration, error } = await supabase
        .from('shopify_integrations')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('active', true)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('❌ SHOPIFY SUPABASE - Erreur récupération par campagne:', error);
        throw error;
      }

      console.log('✅ SHOPIFY SUPABASE - Intégration trouvée:', !!integration);
      return integration || null;

    } catch (error) {
      console.error('❌ SHOPIFY SUPABASE - Erreur:', error);
      return null;
    }
  }
}

export const shopifySupabaseService = new ShopifySupabaseService();