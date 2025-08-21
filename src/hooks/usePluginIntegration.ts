import { useState, useCallback } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface PluginConfig {
  id: string;
  type: 'wordpress' | 'shopify';
  domain: string;
  active: boolean;
  createdAt: Date;
}

export const usePluginIntegration = (campaignId: string, userId: string) => {
  const [configs, setConfigs] = useState<PluginConfig[]>([]);
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateApiKey = useCallback(async () => {
    setIsLoading(true);
    try {
      const generatePluginApiKey = httpsCallable(functions, 'generatePluginApiKey');
      const result = await generatePluginApiKey({ campaignId });
      const data = result.data as { apiKey: string };
      
      setApiKey(data.apiKey);
      return data.apiKey;
    } catch (error) {
      console.error('Erreur génération clé API:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer la clé API",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [campaignId, toast]);

  const configureWordPress = useCallback(async (domain: string) => {
    if (!apiKey) {
      throw new Error('API key required');
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/wordpress-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pluginType: 'wordpress',
          domain,
          apiKey,
          campaignId,
          userId,
          settings: {
            autoInject: true,
            trackingEnabled: true
          }
        })
      });

      if (!response.ok) {
        throw new Error('Configuration failed');
      }

      const result = await response.json();
      
      const newConfig: PluginConfig = {
        id: result.pluginId,
        type: 'wordpress',
        domain,
        active: true,
        createdAt: new Date()
      };
      
      setConfigs(prev => [...prev, newConfig]);
      return result.trackingScript;
    } catch (error) {
      console.error('Erreur configuration WordPress:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [apiKey, campaignId, userId]);

  const configureShopify = useCallback(async (shop: string) => {
    if (!apiKey) {
      throw new Error('API key required');
    }

    // Générer l'URL d'autorisation Shopify
    const state = btoa(JSON.stringify({ campaignId, userId, apiKey }));
    const shopifyUrl = `https://${shop}.myshopify.com/admin/oauth/authorize?client_id=YOUR_SHOPIFY_APP_ID&scope=read_orders,write_script_tags&redirect_uri=https://refspring.com/shopify/callback&state=${state}`;
    
    // Ajouter une configuration en attente
    const newConfig: PluginConfig = {
      id: 'shopify_' + Date.now(),
      type: 'shopify',
      domain: shop + '.myshopify.com',
      active: false,
      createdAt: new Date()
    };
    
    setConfigs(prev => [...prev, newConfig]);
    
    return shopifyUrl;
  }, [apiKey, campaignId, userId]);

  return {
    configs,
    apiKey,
    isLoading,
    generateApiKey,
    configureWordPress,
    configureShopify
  };
};