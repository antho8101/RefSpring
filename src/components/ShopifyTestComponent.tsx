import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Plus } from 'lucide-react';
import { useShopifySupabase } from '@/hooks/useShopifySupabase';
import { ShopifyIntegrationCard } from './ShopifyIntegrationCard';
import { ShopifyIntegrationDialog } from './ShopifyIntegrationDialog';

interface ShopifyTestComponentProps {
  campaignId: string;
}

export const ShopifyTestComponent: React.FC<ShopifyTestComponentProps> = ({ campaignId }) => {
  const { 
    integrations, 
    isLoading, 
    fetchIntegrations, 
    initiateShopifyInstall, 
    removeIntegration 
  } = useShopifySupabase(campaignId);
  
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  const handleInstall = (shopName: string) => {
    // Stocker le campaignId pour le callback
    sessionStorage.setItem('shopify_campaign_id', campaignId);
    initiateShopifyInstall(shopName);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle>Intégrations Shopify</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Connectez vos boutiques Shopify pour le suivi d'affiliation
                </p>
              </div>
            </div>
            <Button onClick={() => setShowDialog(true)} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Ajouter Shopify</span>
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {integrations.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="font-medium text-gray-900 mb-2">Aucune boutique connectée</h3>
              <p className="text-sm text-gray-500 mb-4">
                Connectez votre première boutique Shopify pour commencer
              </p>
              <Button onClick={() => setShowDialog(true)} variant="outline">
                Connecter Shopify
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">
                  {integrations.length} boutique{integrations.length > 1 ? 's' : ''} connectée{integrations.length > 1 ? 's' : ''}
                </Badge>
              </div>
              
              <div className="grid gap-4">
                {integrations.map((integration) => (
                  <ShopifyIntegrationCard
                    key={integration.id}
                    integration={integration}
                    onRemove={removeIntegration}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ShopifyIntegrationDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onInstall={handleInstall}
        isLoading={isLoading}
      />
    </div>
  );
};