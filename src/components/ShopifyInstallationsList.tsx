import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingBag, CheckCircle, XCircle, Trash2, Settings, ExternalLink } from 'lucide-react';
import { ShopifyConfig } from '@/hooks/useShopifyIntegration';

interface ShopifyInstallationsListProps {
  configs: ShopifyConfig[];
  isLoading: boolean;
  onRemove: (configId: string) => void;
  onSetupWebhooks: (configId: string) => void;
}

export const ShopifyInstallationsList: React.FC<ShopifyInstallationsListProps> = ({
  configs,
  isLoading,
  onRemove,
  onSetupWebhooks
}) => {
  if (configs.length === 0) {
    return (
      <Card className="p-6 text-center">
        <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Aucune boutique Shopify connectée</p>
        <p className="text-sm text-muted-foreground mt-1">
          Utilisez le formulaire ci-dessus pour connecter votre première boutique
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Boutiques Shopify connectées</h3>
      
      {configs.map((config) => (
        <Card key={config.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ShoppingBag className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">
                    {config.shopInfo?.name || config.domain}
                  </p>
                  {config.active && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {config.domain}
                </p>
                {config.shopInfo && (
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span>Plan: {config.shopInfo.plan_name}</span>
                    <span>Devise: {config.shopInfo.currency}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Statut des intégrations */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1 text-xs">
                  {config.settings?.scriptsInstalled ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-500" />
                  )}
                  <span>Script</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  {config.settings?.webhooksInstalled ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-500" />
                  )}
                  <span>Webhooks</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {!config.settings?.webhooksInstalled && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSetupWebhooks(config.id)}
                    disabled={isLoading}
                  >
                    <Settings className="h-3 w-3 mr-1" />
                    Setup
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`https://${config.domain.replace('.myshopify.com', '')}.myshopify.com/admin`, '_blank')}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(config.id)}
                  className="text-red-500 hover:text-red-700"
                  disabled={isLoading}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Informations détaillées */}
          {config.settings && (
            <div className="mt-3 pt-3 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Injection automatique:</span>
                  <span className={`ml-2 ${config.settings.autoInject ? 'text-green-600' : 'text-red-600'}`}>
                    {config.settings.autoInject ? 'Activée' : 'Désactivée'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Tracking:</span>
                  <span className="ml-2 text-green-600">Actif</span>
                </div>
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};