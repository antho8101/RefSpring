import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Trash2, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { ShopifyIntegration } from '@/hooks/useShopifySupabase';

interface ShopifyIntegrationCardProps {
  integration: ShopifyIntegration;
  onRemove: (id: string) => void;
}

export const ShopifyIntegrationCard: React.FC<ShopifyIntegrationCardProps> = ({
  integration,
  onRemove
}) => {
  const handleRemove = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette intégration Shopify ?')) {
      onRemove(integration.id);
    }
  };

  const openShopAdmin = () => {
    window.open(`https://${integration.shop_domain}/admin`, '_blank');
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ShoppingBag className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{integration.shop_info.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{integration.shop_domain}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {integration.active ? (
              <Badge variant="default" className="bg-green-100 text-green-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                Actif
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-red-100 text-red-700">
                <AlertCircle className="h-3 w-3 mr-1" />
                Inactif
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Email:</span>
            <p className="text-muted-foreground">{integration.shop_info.email}</p>
          </div>
          <div>
            <span className="font-medium">Devise:</span>
            <p className="text-muted-foreground">{integration.shop_info.currency}</p>
          </div>
          <div>
            <span className="font-medium">Plan:</span>
            <p className="text-muted-foreground">{integration.shop_info.plan_name}</p>
          </div>
          <div>
            <span className="font-medium">Domaine:</span>
            <p className="text-muted-foreground">{integration.shop_info.domain}</p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-sm">Configuration:</h4>
          <div className="flex flex-wrap gap-2">
            <Badge variant={integration.settings.scriptsInstalled ? "default" : "secondary"}>
              Scripts: {integration.settings.scriptsInstalled ? 'Installés' : 'Non installés'}
            </Badge>
            <Badge variant={integration.settings.webhooksInstalled ? "default" : "secondary"}>
              Webhooks: {integration.settings.webhooksInstalled ? 'Actifs' : 'Inactifs'}
            </Badge>
            <Badge variant={integration.settings.autoInject ? "default" : "secondary"}>
              Auto-injection: {integration.settings.autoInject ? 'Activée' : 'Désactivée'}
            </Badge>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          <div className="text-xs text-muted-foreground">
            Connecté le {new Date(integration.created_at).toLocaleDateString('fr-FR')}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={openShopAdmin}
              className="flex items-center space-x-1"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Admin</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemove}
              className="flex items-center space-x-1 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              <span>Supprimer</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};