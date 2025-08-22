import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Settings } from 'lucide-react';

interface ShopifyConfigDialogProps {
  userId: string;
}

export const ShopifyConfigDialog: React.FC<ShopifyConfigDialogProps> = ({ userId }) => {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!apiKey || !apiSecret) {
      toast({
        title: 'Erreur',
        description: 'La clé API et la clé secrète sont obligatoires',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Stocker la config Shopify dans Firestore de manière sécurisée
      await setDoc(doc(db, 'shopify_configs', userId), {
        apiKey,
        apiSecret,
        webhookSecret: webhookSecret || `webhook_${Date.now()}`,
        appUrl: 'https://refspring.com',
        scopes: ['read_orders', 'read_products', 'write_script_tags', 'read_customers'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      toast({
        title: 'Configuration sauvegardée',
        description: 'Vos clés Shopify ont été configurées avec succès',
      });

      setIsOpen(false);
      setApiKey('');
      setApiSecret('');
      setWebhookSecret('');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder la configuration',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Configurer Shopify
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configuration Shopify</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="apiKey">Clé API Shopify *</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Entrez votre clé API"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="apiSecret">Clé secrète Shopify *</Label>
            <Input
              id="apiSecret"
              type="password"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              placeholder="Entrez votre clé secrète"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="webhookSecret">Secret webhook (optionnel)</Label>
            <Input
              id="webhookSecret"
              type="password"
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              placeholder="Secret pour les webhooks (auto-généré si vide)"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};