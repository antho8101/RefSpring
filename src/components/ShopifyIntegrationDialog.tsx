import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { ShopifyPrivateAppDialog } from '@/components/ShopifyPrivateAppDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useCampaignData } from '@/hooks/useCampaignData';
import { toast } from '@/hooks/use-toast';

interface ShopifyIntegrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInstall: (shopName: string) => void;
  isLoading: boolean;
}

export const ShopifyIntegrationDialog: React.FC<ShopifyIntegrationDialogProps> = ({
  open,
  onOpenChange,
  onInstall,
  isLoading
}) => {
  const [shopName, setShopName] = useState('');
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [showPrivateAppDialog, setShowPrivateAppDialog] = useState(false);
  
  // Récupération des campagnes de l'utilisateur
  const { user, loading: authLoading } = useAuth();
  const { campaigns, loading: campaignsLoading } = useCampaignData(user?.uid || null, authLoading);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (shopName.trim() && selectedCampaignId) {
      setShowPrivateAppDialog(true);
    } else if (!selectedCampaignId) {
      toast({
        title: "Campagne requise",
        description: "Veuillez sélectionner une campagne avant de continuer",
        variant: "destructive"
      });
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setShopName('');
      setSelectedCampaignId('');
      onOpenChange(false);
    }
  };

  // Vérification si aucune campagne disponible
  const noCampaignsAvailable = !campaignsLoading && campaigns.length === 0;

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <DialogTitle>Connecter Shopify</DialogTitle>
                <DialogDescription>
                  Connectez votre boutique Shopify via une application privée (plus simple et sécurisé)
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {noCampaignsAvailable ? (
            <div className="text-center py-6 space-y-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <h4 className="font-medium text-orange-900 mb-2">Aucune campagne disponible</h4>
                <p className="text-sm text-orange-800">
                  Vous devez créer au moins une campagne avec un moyen de paiement configuré avant de pouvoir connecter Shopify.
                </p>
              </div>
              <Button variant="outline" onClick={handleClose}>
                Fermer
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="campaign">Campagne à connecter</Label>
                <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une campagne" />
                  </SelectTrigger>
                  <SelectContent>
                    {campaigns.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Cette boutique Shopify sera liée à la campagne sélectionnée
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="shopName">Nom de votre boutique Shopify</Label>
                <Input
                  id="shopName"
                  type="text"
                  placeholder="ma-boutique"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  disabled={isLoading || campaignsLoading}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Entrez uniquement le nom de votre boutique (sans .myshopify.com)
                </p>
              </div>

            <div className="bg-green-50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium text-green-900">Nouvelle méthode simplifiée !</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Plus de problèmes d'OAuth ou d'URLs de redirection</li>
                <li>• Vous créez une "application privée" dans votre admin Shopify</li>
                <li>• Vous copiez/collez simplement le token d'accès</li>
                <li>• Configuration en 2 minutes maximum</li>
              </ul>
            </div>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading || campaignsLoading}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={!shopName.trim() || !selectedCampaignId || isLoading || campaignsLoading}
                  className="flex items-center space-x-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  <span>Continuer</span>
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <ShopifyPrivateAppDialog
        open={showPrivateAppDialog}
        onOpenChange={setShowPrivateAppDialog}
        shopName={shopName}
        campaignId={selectedCampaignId}
        onSuccess={() => {
          toast({
            title: "Configuration terminée !",
            description: "Votre boutique Shopify est maintenant connectée",
          });
          handleClose();
        }}
      />
    </>
  );
};