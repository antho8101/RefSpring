import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Key, AlertTriangle, ExternalLink } from 'lucide-react';

export const ShopifyTokenRecovery: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'private-app' | 'oauth-app'>('private-app');

  const handleCreatePrivateApp = () => {
    const shopifyUrl = 'https://admin.shopify.com/settings/apps/private';
    window.open(shopifyUrl, '_blank');
  };

  const handleManageOAuthApp = () => {
    const partnerUrl = 'https://partners.shopify.com/organizations';
    window.open(partnerUrl, '_blank');
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-orange-800">
          <Key className="h-5 w-5" />
          <span>Récupération d'accès API Shopify</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Alert className="border-orange-200 bg-orange-100">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Token expiré ou révoqué :</strong> Votre accès à l'API Shopify n'est plus valide. 
            Choisissez une option ci-dessous pour le restaurer.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Option 1: Private App */}
          <Card className={`cursor-pointer transition-all ${activeTab === 'private-app' ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Private App (Recommandé)</CardTitle>
                <Badge variant="secondary" className="bg-green-100 text-green-800">Facile</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Créez une app privée directement dans votre admin Shopify
              </p>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Étapes :</h4>
                <ol className="list-decimal list-inside text-xs space-y-1">
                  <li>Aller dans Shopify Admin → Paramètres → Apps et canaux de vente</li>
                  <li>Cliquer sur "Développer des applications"</li>
                  <li>Créer une nouvelle app privée</li>
                  <li>Configurer les permissions Admin API</li>
                  <li>Générer un token d'accès</li>
                </ol>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">Permissions requises :</h4>
                <div className="text-xs space-y-1">
                  <div>• <code>read_orders, write_orders</code></div>
                  <div>• <code>read_customers, write_customers</code></div>
                  <div>• <code>read_products</code></div>
                  <div>• <code>write_script_tags</code></div>
                </div>
              </div>

              <Button 
                onClick={handleCreatePrivateApp}
                className="w-full"
                variant="outline"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ouvrir Shopify Admin
              </Button>
            </CardContent>
          </Card>

          {/* Option 2: OAuth App */}
          <Card className={`cursor-pointer transition-all ${activeTab === 'oauth-app' ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">App OAuth (Avancé)</CardTitle>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Complexe</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Gérez votre app OAuth depuis Shopify Partners
              </p>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Actions possibles :</h4>
                <ul className="list-disc list-inside text-xs space-y-1">
                  <li>Vérifier le statut de votre app</li>
                  <li>Régénérer les clés API</li>
                  <li>Réinstaller l'app sur votre boutique</li>
                  <li>Déboguer les problèmes de permissions</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-xs text-yellow-800">
                  <strong>Note :</strong> Nécessite un compte Shopify Partners et une app configurée
                </p>
              </div>

              <Button 
                onClick={handleManageOAuthApp}
                className="w-full"
                variant="outline"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ouvrir Partners Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Après avoir récupéré l'accès :</h3>
          <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
            <li>Utilisez le bouton "Ajouter Shopify" ci-dessus</li>
            <li>Entrez votre token d'accès Private App</li>
            <li>Ou refaites le processus OAuth complet</li>
            <li>Testez la connexion avec le diagnostic</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};