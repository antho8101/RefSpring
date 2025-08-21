import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

export interface ShopifyConfig {
  id: string;
  type: 'shopify';
  domain: string;
  active: boolean;
  shopInfo?: {
    name: string;
    email: string;
    plan_name: string;
    currency: string;
  };
  settings?: {
    scriptsInstalled: boolean;
    webhooksInstalled: boolean;
    autoInject: boolean;
  };
}

export const useShopifyIntegration = (campaignId: string, userId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [configs, setConfigs] = useState<ShopifyConfig[]>([]);

  // Initier le processus d'installation Shopify
  const initiateShopifyInstall = async (shopName: string) => {
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
      // Générer un state sécurisé pour OAuth
      const oauthState = btoa(`${campaignId}:${userId}:${Date.now()}:${uuidv4()}`);
      
      // Stocker les infos dans sessionStorage pour le callback
      sessionStorage.setItem('shopify_oauth_state', JSON.stringify({
        state: oauthState,
        campaignId,
        userId,
        shopName
      }));

      // Obtenir l'URL d'autorisation Shopify
      const response = await fetch('/api/shopify-auth-callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shop: shopName.includes('.myshopify.com') ? shopName : `${shopName}.myshopify.com`,
          campaignId,
          state: oauthState
        })
      });

      if (!response.ok) {
        throw new Error('Impossible de générer l\'URL d\'autorisation');
      }

      const { authUrl } = await response.json();
      
      // Rediriger vers Shopify pour l'autorisation
      window.location.href = authUrl;

    } catch (error) {
      console.error('Erreur initiation Shopify:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'initier l'installation Shopify",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  // Finaliser l'installation après le callback OAuth
  const finalizeShopifyInstall = async (code: string, state: string, shop: string) => {
    setIsLoading(true);

    try {
      // Vérifier le state OAuth
      const storedData = sessionStorage.getItem('shopify_oauth_state');
      if (!storedData) {
        throw new Error('Session expirée, veuillez recommencer');
      }

      const { state: expectedState, campaignId: storedCampaignId } = JSON.parse(storedData);
      if (state !== expectedState || storedCampaignId !== campaignId) {
        throw new Error('État OAuth invalide');
      }

      // Échanger le code contre un access token
      const response = await fetch('/api/shopify-auth-callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shop,
          code,
          state,
          campaignId
        })
      });

      if (!response.ok) {
        throw new Error('Échec de l\'authentification Shopify');
      }

      const result = await response.json();

      // Ajouter la nouvelle configuration
      const newConfig: ShopifyConfig = {
        id: result.pluginId,
        type: 'shopify',
        domain: shop,
        active: true,
        shopInfo: result.shopInfo,
        settings: {
          scriptsInstalled: true,
          webhooksInstalled: false,
          autoInject: true
        }
      };

      setConfigs(prev => [...prev, newConfig]);

      // Nettoyer le sessionStorage
      sessionStorage.removeItem('shopify_oauth_state');

      toast({
        title: "Shopify installé !",
        description: `L'app RefSpring est maintenant active sur ${result.shopInfo.name}`,
      });

      // Installer les webhooks automatiquement
      await setupWebhooks(result.pluginId);

    } catch (error) {
      console.error('Erreur finalisation Shopify:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de finaliser l'installation",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Configurer les webhooks Shopify
  const setupWebhooks = async (pluginId: string) => {
    try {
      const response = await fetch('/api/shopify-webhooks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pluginId,
          campaignId
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Mettre à jour la config
        setConfigs(prev => prev.map(config => 
          config.id === pluginId 
            ? { ...config, settings: { ...config.settings, webhooksInstalled: true } }
            : config
        ));

        toast({
          title: "Webhooks configurés",
          description: `${result.webhooksInstalled} webhooks installés avec succès`,
        });
      }
    } catch (error) {
      console.error('Erreur webhooks:', error);
    }
  };

  // Supprimer une configuration Shopify
  const removeShopifyConfig = async (configId: string) => {
    try {
      setConfigs(prev => prev.filter(config => config.id !== configId));
      
      toast({
        title: "Configuration supprimée",
        description: "La configuration Shopify a été supprimée",
      });
    } catch (error) {
      console.error('Erreur suppression config:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la configuration",
        variant: "destructive"
      });
    }
  };

  // Vérifier l'état des installations
  const checkInstallationStatus = async () => {
    try {
      const response = await fetch('/api/shopify-config', {
        method: 'GET',
        headers: {
          'campaign-id': campaignId
        }
      });

      if (response.ok) {
        const { installations } = await response.json();
        setConfigs(installations.map((install: any) => ({
          id: install.id,
          type: 'shopify',
          domain: install.shopDomain,
          active: true,
          shopInfo: install.shopInfo,
          settings: install.settings
        })));
      }
    } catch (error) {
      console.error('Erreur vérification installations:', error);
    }
  };

  return {
    configs,
    isLoading,
    initiateShopifyInstall,
    finalizeShopifyInstall,
    removeShopifyConfig,
    checkInstallationStatus,
    setupWebhooks
  };
};