import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { ExternalLink, Copy, CheckCircle } from 'lucide-react';

interface ShopifyPrivateAppDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shopName: string;
  onConnect: (accessToken: string, shopDomain: string) => void;
}

export const ShopifyPrivateAppDialog = ({ 
  open, 
  onOpenChange, 
  shopName,
  onConnect 
}: ShopifyPrivateAppDialogProps) => {
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(false);
  
  const shopDomain = shopName.includes('.myshopify.com') ? shopName : `${shopName}.myshopify.com`;
  const shopifyUrl = `https://${shopDomain}/admin/settings/apps`;

  const instructions = `1. Allez dans Paramètres → Applications et canaux de vente
2. Cliquez sur "Développer des applications"
3. Cliquez sur "Autoriser le développement d'applications personnalisées" (si nécessaire)
4. Cliquez sur "Créer une application"
5. Nommez l'app "RefSpring Integration"
6. Dans Configuration → Admin API access, accordez ces permissions :
   - Orders: read_orders, write_orders
   - Customers: read_customers, write_customers
   - Products: read_products
   - Script Tags: write_script_tags
7. Cliquez sur "Sauvegarder"
8. Dans "Identifiants d'API", copiez le "Admin API access token"
9. Collez ce token ci-dessous`;

  const handleConnect = async () => {
    if (!accessToken.trim()) {
      toast({
        title: "Token requis",
        description: "Veuillez entrer votre Admin API access token",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Pas de validation côté client à cause des problèmes CORS
      // La validation se fera côté serveur
      toast({
        title: "Connexion en cours...",
        description: "Vérification du token avec votre boutique",
      });

      onConnect(accessToken, shopDomain);
      onOpenChange(false);
      
    } catch (error) {
      console.error('Erreur connexion:', error);
      toast({
        title: "Erreur de connexion",
        description: "Une erreur s'est produite",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyInstructions = () => {
    navigator.clipboard.writeText(instructions);
    toast({
      title: "Instructions copiées",
      description: "Les instructions ont été copiées dans le presse-papiers",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Connecter votre boutique Shopify</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Instructions étape par étape :</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={copyInstructions}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Copier
              </Button>
            </div>
            <Textarea 
              value={instructions}
              readOnly
              className="min-h-[200px] text-sm bg-background"
            />
          </div>

          <div className="flex justify-center">
            <Button 
              onClick={() => window.open(shopifyUrl, '_blank')} 
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Ouvrir votre admin Shopify
            </Button>
          </div>

          <div className="space-y-3">
            <Label htmlFor="access-token">Admin API Access Token</Label>
            <Input
              id="access-token"
              type="password"
              placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="font-mono"
            />
            <p className="text-sm text-muted-foreground">
              Le token commence généralement par "shpat_"
            </p>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleConnect} 
              disabled={loading || !accessToken.trim()}
              className="gap-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Vérification...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Connecter
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};