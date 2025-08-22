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
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { ShopifyPrivateAppDialog } from '@/components/ShopifyPrivateAppDialog';
import { supabase } from '@/integrations/supabase/client';
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
  const [showPrivateAppDialog, setShowPrivateAppDialog] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (shopName.trim()) {
      setShowPrivateAppDialog(true);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setShopName('');
      onOpenChange(false);
    }
  };

  const handleConnect = async (accessToken: string, shopDomain: string) => {
    // Sauvegarder l'intégration via l'edge function
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté",
          variant: "destructive"
        });
        return;
      }

      const response = await supabase.functions.invoke('shopify-private-app', {
        body: {
          shopDomain,
          accessToken,
          campaignId: 'test-campaign-123', // TODO: récupérer le vrai campaign ID
          userId: user.id
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast({
        title: "Shopify connecté !",
        description: `Boutique ${response.data.shopInfo.name} connectée avec succès`,
      });

      setShowPrivateAppDialog(false);
      handleClose();
      
    } catch (error) {
      console.error('Erreur connexion Shopify:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la connexion",
        variant: "destructive"
      });
    }
  };

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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="shopName">Nom de votre boutique Shopify</Label>
              <Input
                id="shopName"
                type="text"
                placeholder="ma-boutique"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                disabled={isLoading}
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
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={!shopName.trim() || isLoading}
                className="flex items-center space-x-2"
              >
                <ArrowRight className="h-4 w-4" />
                <span>Continuer</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ShopifyPrivateAppDialog
        open={showPrivateAppDialog}
        onOpenChange={setShowPrivateAppDialog}
        shopName={shopName}
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