import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ShoppingBag, ExternalLink } from 'lucide-react';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (shopName.trim()) {
      onInstall(shopName.trim());
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setShopName('');
      onOpenChange(false);
    }
  };

  return (
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
                Connectez votre boutique Shopify pour activer le suivi d'affiliation
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

          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-blue-900">Que va-t-il se passer ?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Vous serez redirigé vers Shopify pour autoriser l'application</li>
              <li>• RefSpring accédera à vos commandes et produits en lecture seule</li>
              <li>• Les scripts de suivi seront installés automatiquement</li>
              <li>• Vos commandes d'affiliation seront trackées en temps réel</li>
            </ul>
          </div>

          <DialogFooter className="flex justify-between">
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
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <ExternalLink className="h-4 w-4" />
              )}
              <span>
                {isLoading ? 'Connexion...' : 'Connecter à Shopify'}
              </span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};