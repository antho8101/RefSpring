import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Globe, ShoppingBag, Key, ExternalLink } from 'lucide-react';
import { CopyButton } from '@/components/CopyButton';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { ShopifyConfigDialog } from '@/components/ShopifyConfigDialog';
import { useShopifyIntegration } from '@/hooks/useShopifyIntegration';
import { ShopifyInstallationsList } from '@/components/ShopifyInstallationsList';

interface PluginIntegrationProps {
  campaignId: string;
  userId: string;
}

interface PluginConfig {
  id: string;
  type: 'wordpress' | 'shopify';
  domain: string;
  active: boolean;
  createdAt: Date;
}

export const PluginIntegration: React.FC<PluginIntegrationProps> = ({ campaignId, userId }) => {
  const [activeTab, setActiveTab] = useState('wordpress');
  const [wordpressDomain, setWordpressDomain] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [trackingScript, setTrackingScript] = useState('');
  const [configs, setConfigs] = useState<PluginConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  
  // Hook pour gérer Shopify
  const {
    configs: shopifyConfigs,
    isLoading: shopifyLoading,
    initiateShopifyInstall,
    removeShopifyConfig,
    setupWebhooks
  } = useShopifyIntegration(campaignId, userId);

  const generateApiKey = async () => {
    setIsLoading(true);
    try {
      const generatePluginApiKey = httpsCallable(functions, 'generatePluginApiKey');
      const result = await generatePluginApiKey({ campaignId });
      const data = result.data as { apiKey: string };
      
      setApiKey(data.apiKey);
      toast({
        title: "Clé API générée",
        description: "Votre clé API a été créée avec succès",
      });
    } catch (error) {
      console.error('Erreur génération clé API:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer la clé API",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const configureWordPress = async () => {
    if (!wordpressDomain.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer le domaine de votre site WordPress",
        variant: "destructive"
      });
      return;
    }

    if (!apiKey) {
      toast({
        title: "Erreur",
        description: "Veuillez d'abord générer une clé API",
        variant: "destructive"
      });
      return;
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
          domain: wordpressDomain,
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
      setTrackingScript(result.trackingScript);
      
      const newConfig: PluginConfig = {
        id: result.pluginId,
        type: 'wordpress',
        domain: wordpressDomain,
        active: true,
        createdAt: new Date()
      };
      
      setConfigs([...configs, newConfig]);
      setWordpressDomain('');
      
      toast({
        title: "WordPress configuré",
        description: "Le plugin WordPress a été configuré avec succès",
      });
    } catch (error) {
      console.error('Erreur configuration WordPress:', error);
      toast({
        title: "Erreur",
        description: "Impossible de configurer WordPress",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShopifyInstall = async (shopName: string) => {
    try {
      await initiateShopifyInstall(shopName);
    } catch (error) {
      console.error('Erreur installation Shopify:', error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer l'installation Shopify",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={generateApiKey} disabled={isLoading} variant="outline">
          <Key className="h-4 w-4 mr-2" />
          Générer Clé API
        </Button>
      </div>

      {apiKey && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Clé API RefSpring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Input value={apiKey} readOnly className="font-mono" />
              <CopyButton 
                text={apiKey}
                itemKey="api-key"
                label="Clé API"
                copiedItems={copiedItems}
                setCopiedItems={setCopiedItems}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Utilisez cette clé pour authentifier vos plugins
            </p>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="wordpress" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            WordPress
          </TabsTrigger>
          <TabsTrigger value="shopify" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Shopify
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wordpress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration WordPress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="wordpress-domain">Domaine de votre site WordPress</Label>
                <Input
                  id="wordpress-domain"
                  placeholder="monsite.com"
                  value={wordpressDomain}
                  onChange={(e) => setWordpressDomain(e.target.value)}
                />
              </div>
              <Button onClick={configureWordPress} disabled={isLoading} className="w-full">
                <Globe className="h-4 w-4 mr-2" />
                Configurer WordPress
              </Button>
            </CardContent>
          </Card>

          {trackingScript && (
            <Card>
              <CardHeader>
                <CardTitle>Code PHP à ajouter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Ajoutez ce code dans le fichier functions.php de votre thème WordPress :
                  </p>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                      <code>{trackingScript}</code>
                    </pre>
                    <div className="absolute top-2 right-2">
                      <CopyButton 
                        text={trackingScript}
                        itemKey="wp-script"
                        label="Code WordPress"
                        copiedItems={copiedItems}
                        setCopiedItems={setCopiedItems}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="shopify" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Configuration Shopify</CardTitle>
                <div className="flex items-center gap-2">
                  <ShopifyConfigDialog userId={userId} />
                  <Badge variant={shopifyConfigs.length > 0 ? "default" : "secondary"}>
                    {shopifyConfigs.length} boutique{shopifyConfigs.length !== 1 ? 's' : ''} connectée{shopifyConfigs.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ShopifyInstallationsList
                configs={shopifyConfigs}
                isLoading={shopifyLoading}
                onRemove={removeShopifyConfig}
                onSetupWebhooks={setupWebhooks}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {configs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Plugins Configurés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {configs.map((config) => (
                <div key={config.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {config.type === 'wordpress' ? (
                      <Globe className="h-5 w-5" />
                    ) : (
                      <ShoppingBag className="h-5 w-5" />
                    )}
                    <div>
                      <p className="font-medium">{config.domain}</p>
                      <p className="text-sm text-muted-foreground">
                        Configuré le {config.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={config.active ? "default" : "secondary"}>
                    {config.active ? "Actif" : "Inactif"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};