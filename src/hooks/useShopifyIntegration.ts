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

  // Initier le processus d'installation Shopify (Private App)
  const initiateShopifyInstall = async (shopName: string) => {
    if (!shopName.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer le nom de votre boutique Shopify",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Nettoyer le nom de boutique
      const cleanShopName = shopName.replace(/\.myshopify\.com$/, '');
      const shopDomain = `${cleanShopName}.myshopify.com`;
      
      // Pour les private apps, on utilise une approche manuelle
      const instructions = `
📝 Instructions pour connecter votre boutique Shopify :

1. Allez dans votre admin Shopify (${shopDomain}/admin)
2. Paramètres → Applications et canaux de vente  
3. Cliquez sur "Développer des applications"
4. Cliquez sur "Autoriser le développement d'applications personnalisées" si nécessaire
5. Cliquez sur "Créer une application"
6. Nommez l'app "RefSpring Integration"
7. Dans "Configuration" → "Admin API access" :
   - Orders: read_orders, write_orders
   - Customers: read_customers, write_customers  
   - Products: read_products
   - Script Tags: write_script_tags
8. Cliquez sur "Sauvegarder"
9. Dans "Identifiants d'API", copiez le "Admin API access token"
10. Revenez dans RefSpring et collez ce token

Cette méthode est plus simple et évite les problèmes OAuth !
      `;
      
      // Ouvrir Shopify dans un nouvel onglet
      const shopifyUrl = `https://${shopDomain}/admin/settings/apps`;
      window.open(shopifyUrl, '_blank');
      
      // Afficher les instructions
      alert(instructions);
      
      toast({
        title: "Instructions affichées",
        description: "Suivez les étapes pour créer votre app privée Shopify",
      });
      
    } catch (error) {
      console.error('Erreur initiation Shopify:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ouvrir Shopify",
        variant: "destructive"
      });
    } finally {
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