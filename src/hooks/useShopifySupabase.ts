import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface ShopifyIntegration {
  id: string;
  shop_domain: string;
  shop_info: {
    name: string;
    email: string;
    domain: string;
    currency: string;
    plan_name: string;
  };
  settings: {
    scriptsInstalled: boolean;
    webhooksInstalled: boolean;
    autoInject: boolean;
    scopes?: string[];
  };
  active: boolean;
  created_at: string;
}

export const useShopifySupabase = (campaignId: string) => {
  const [integrations, setIntegrations] = useState<ShopifyIntegration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Récupérer les intégrations existantes
  const fetchIntegrations = useCallback(async () => {
    try {
      if (!user) throw new Error('Utilisateur non connecté');

      const { data, error } = await supabase
        .from('shopify_integrations')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('user_id', user.uid)
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transformer les données pour correspondre à notre interface
      const transformedData = (data || []).map(item => ({
        id: item.id,
        shop_domain: item.shop_domain,
        shop_info: item.shop_info as any,
        settings: item.settings as any,
        active: item.active,
        created_at: item.created_at
      }));

      setIntegrations(transformedData);
    } catch (error) {
      console.error('Erreur récupération intégrations:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les intégrations Shopify",
        variant: "destructive"
      });
    }
  }, [campaignId, user]);

  // Initier l'installation Shopify
  const initiateShopifyInstall = useCallback(async (shopName: string) => {
    if (!shopName.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer le nom de votre boutique Shopify",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      if (!user) throw new Error('Utilisateur non connecté');

      // Appeler l'Edge Function pour générer l'URL d'autorisation
      const { data, error } = await supabase.functions.invoke('shopify-auth', {
        body: {
          shop: shopName.includes('.myshopify.com') ? shopName : `${shopName}.myshopify.com`,
          campaignId,
          userId: user.uid
        }
      });

      if (error) throw error;
      
      if (!data?.authUrl) {
        throw new Error('URL d\'autorisation non reçue');
      }

      // Rediriger vers Shopify dans une nouvelle fenêtre
      const popup = window.open(data.authUrl, 'shopify-auth', 'width=600,height=700,scrollbars=yes,resizable=yes');
      
      if (!popup) {
        throw new Error('Le popup a été bloqué. Veuillez autoriser les popups pour ce site.');
      }

      // Surveiller la fermeture du popup
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setIsLoading(false);
          // Rafraîchir les intégrations au cas où l'autorisation aurait réussi
          fetchIntegrations();
        }
      }, 1000);

    } catch (error) {
      console.error('Erreur initiation OAuth:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'initier l'installation Shopify",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  }, [campaignId]);

  // Finaliser l'installation après le callback
  const finalizeShopifyInstall = useCallback(async (code: string, state: string, shop: string) => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('shopify-callback', {
        body: { code, state, shop }
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || 'Échec de l\'installation');
      }

      toast({
        title: "Installation réussie !",
        description: `Shopify connecté pour ${data.integration.shopInfo.name}`,
      });

      // Rafraîchir la liste des intégrations
      await fetchIntegrations();

      return data.integration;

    } catch (error) {
      console.error('Erreur finalisation OAuth:', error);
      toast({
        title: "Erreur d'installation",
        description: error.message || "Impossible de finaliser l'installation",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fetchIntegrations]);

  // Supprimer une intégration
  const removeIntegration = useCallback(async (integrationId: string) => {
    try {
      const { error } = await supabase
        .from('shopify_integrations')
        .update({ active: false })
        .eq('id', integrationId);

      if (error) throw error;

      toast({
        title: "Intégration supprimée",
        description: "L'intégration Shopify a été désactivée",
      });

      // Rafraîchir la liste
      await fetchIntegrations();

    } catch (error) {
      console.error('Erreur suppression intégration:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'intégration",
        variant: "destructive"
      });
    }
  }, [fetchIntegrations]);

  return {
    integrations,
    isLoading,
    fetchIntegrations,
    initiateShopifyInstall,
    finalizeShopifyInstall,
    removeIntegration
  };
};