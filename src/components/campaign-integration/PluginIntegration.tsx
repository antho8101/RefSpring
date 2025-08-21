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
  const [shopifyShop, setShopifyShop] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [trackingScript, setTrackingScript] = useState('');
  const [configs, setConfigs] = useState<PluginConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());
  const { toast } = useToast();

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

  const configureShopify = async () => {
    if (!shopifyShop.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer le nom de votre boutique Shopify",
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
      const state = btoa(JSON.stringify({ campaignId, userId, apiKey }));
      const shopifyUrl = `https://${shopifyShop}.myshopify.com/admin/oauth/authorize?client_id=YOUR_SHOPIFY_APP_ID&scope=read_orders,write_script_tags&redirect_uri=https://refspring.com/shopify/callback&state=${state}`;
      
      window.open(shopifyUrl, '_blank');
      
      const newConfig: PluginConfig = {
        id: 'shopify_' + Date.now(),
        type: 'shopify',
        domain: shopifyShop + '.myshopify.com',
        active: false,
        createdAt: new Date()
      };
      
      setConfigs([...configs, newConfig]);
      setShopifyShop('');
      
      toast({
        title: "Redirection Shopify",
        description: "Autorisez l'application dans la nouvelle fenêtre pour terminer l'installation",
      });
    } catch (error) {
      console.error('Erreur configuration Shopify:', error);
      toast({
        title: "Erreur",
        description: "Impossible de configurer Shopify",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-900">Configuration des plugins</h3>
        <p className="text-slate-600">
          Configurez RefSpring directement sur WordPress et Shopify sans code
        </p>
      </div>

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
              <CardTitle>Configuration Shopify</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="shopify-shop">Nom de votre boutique Shopify</Label>
                <Input
                  id="shopify-shop"
                  placeholder="ma-boutique"
                  value={shopifyShop}
                  onChange={(e) => setShopifyShop(e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Sans .myshopify.com (ex: ma-boutique)
                </p>
              </div>
              <Button onClick={configureShopify} disabled={isLoading} className="w-full">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Installer sur Shopify
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
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