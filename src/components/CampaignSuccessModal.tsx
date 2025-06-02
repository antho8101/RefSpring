
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check, Code, Link } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CampaignSuccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string;
  campaignName: string;
}

export const CampaignSuccessModal = ({ 
  open, 
  onOpenChange, 
  campaignId, 
  campaignName 
}: CampaignSuccessModalProps) => {
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const trackingUrl = `https://refspring.com/r/${campaignId}`;
  
  const trackingScript = `<!-- RefSpring Tracking Script -->
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://refspring.com/tracking.js';
    script.setAttribute('data-campaign', '${campaignId}');
    script.async = true;
    document.head.appendChild(script);
  })();
</script>`;

  const conversionCode = `<!-- RefSpring Conversion Tracking - Placez ce code sur votre page de confirmation de commande -->
<script>
  if (typeof RefSpring !== 'undefined') {
    RefSpring.trackConversion({
      campaignId: '${campaignId}',
      orderId: 'ORDER_ID_UNIQUE', // Remplacez par l'ID de commande réel
      amount: 99.99, // Remplacez par le montant réel
      currency: 'EUR'
    });
  }
</script>`;

  const copyToClipboard = async (text: string, itemKey: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems(prev => new Set([...prev, itemKey]));
      
      toast({
        title: "Copié !",
        description: `${label} copié dans le presse-papiers`,
      });

      // Reset le statut après 2 secondes
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemKey);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier dans le presse-papiers",
        variant: "destructive",
      });
    }
  };

  const CopyButton = ({ onClick, itemKey, label }: { 
    onClick: () => void; 
    itemKey: string; 
    label: string; 
  }) => {
    const isCopied = copiedItems.has(itemKey);
    
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onClick}
        className="ml-2"
      >
        {isCopied ? (
          <>
            <Check className="h-4 w-4 mr-1 text-green-600" />
            Copié
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 mr-1" />
            Copier
          </>
        )}
      </Button>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            Campagne "{campaignName}" créée avec succès !
          </DialogTitle>
          <DialogDescription>
            Voici les informations importantes pour configurer votre campagne d'affiliation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* URL de tracking */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-base font-medium">
              <Link className="h-4 w-4" />
              URL de tracking pour vos affiliés
            </Label>
            <p className="text-sm text-muted-foreground">
              Partagez cette URL avec vos affiliés. Toutes les visites via cette URL seront trackées.
            </p>
            <div className="flex items-center gap-2">
              <Input 
                value={trackingUrl} 
                readOnly 
                className="font-mono text-sm"
              />
              <CopyButton 
                onClick={() => copyToClipboard(trackingUrl, 'url', 'URL de tracking')}
                itemKey="url"
                label="URL"
              />
            </div>
          </div>

          {/* Script de tracking */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-base font-medium">
              <Code className="h-4 w-4" />
              Script de tracking
            </Label>
            <p className="text-sm text-muted-foreground">
              Ajoutez ce code dans la section &lt;head&gt; de toutes les pages de votre site.
            </p>
            <div className="relative">
              <Textarea 
                value={trackingScript}
                readOnly 
                className="font-mono text-xs min-h-[120px] resize-none"
              />
              <div className="absolute top-2 right-2">
                <CopyButton 
                  onClick={() => copyToClipboard(trackingScript, 'script', 'Script de tracking')}
                  itemKey="script"
                  label="Script"
                />
              </div>
            </div>
          </div>

          {/* Code de conversion */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-base font-medium">
              <Code className="h-4 w-4" />
              Code de conversion
            </Label>
            <p className="text-sm text-muted-foreground">
              Ajoutez ce code sur votre page de confirmation de commande pour tracker les conversions.
            </p>
            <div className="relative">
              <Textarea 
                value={conversionCode}
                readOnly 
                className="font-mono text-xs min-h-[140px] resize-none"
              />
              <div className="absolute top-2 right-2">
                <CopyButton 
                  onClick={() => copyToClipboard(conversionCode, 'conversion', 'Code de conversion')}
                  itemKey="conversion"
                  label="Code"
                />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">📋 Étapes suivantes :</h4>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Copiez et ajoutez le script de tracking dans votre site</li>
              <li>Copiez et ajoutez le code de conversion sur votre page de commande</li>
              <li>Partagez l'URL de tracking avec vos affiliés</li>
              <li>Consultez les statistiques dans votre dashboard</li>
            </ol>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
