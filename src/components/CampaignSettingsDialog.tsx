
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useToast } from '@/hooks/use-toast';
import { Settings, Trash2, Code, Copy, Check } from 'lucide-react';
import { Campaign } from '@/types';

interface CampaignSettingsDialogProps {
  campaign: Campaign;
}

export const CampaignSettingsDialog = ({ campaign }: CampaignSettingsDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    name: campaign.name,
    description: campaign.description,
    targetUrl: campaign.targetUrl,
    isActive: campaign.isActive,
  });
  
  const { updateCampaign, deleteCampaign } = useCampaigns();
  const { toast } = useToast();

  const trackingScript = `<!-- RefSpring Tracking Script -->
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://refspring.com/tracking.js';
    script.setAttribute('data-campaign', '${campaign.id}');
    script.async = true;
    document.head.appendChild(script);
  })();
</script>`;

  const conversionCode = `<!-- RefSpring Conversion Tracking - Placez ce code sur votre page de confirmation de commande -->
<script>
  if (typeof RefSpring !== 'undefined') {
    RefSpring.trackConversion({
      campaignId: '${campaign.id}',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateCampaign(campaign.id, formData);
      
      toast({
        title: "Campagne mise à jour",
        description: "Les paramètres de la campagne ont été sauvegardés",
      });
      
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour la campagne",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCampaign(campaign.id);
      toast({
        title: "Campagne supprimée",
        description: "La campagne a été supprimée avec succès",
      });
      setOpen(false);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la campagne",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="hover:scale-105 transition-all shadow-lg backdrop-blur-sm border-slate-300">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto bg-white/95 backdrop-blur-xl border-slate-200">
        <DialogHeader>
          <DialogTitle>Paramètres de la campagne</DialogTitle>
          <DialogDescription>
            Modifiez les paramètres de "{campaign.name}"
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 py-4">
            {/* État de la campagne */}
            <div className={`flex items-center justify-between p-4 rounded-lg ${
              formData.isActive 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-orange-50 border border-orange-200'
            }`}>
              <div className="space-y-1">
                <Label className="text-sm font-medium">État de la campagne</Label>
                <p className={`text-xs ${
                  formData.isActive 
                    ? 'text-green-700' 
                    : 'text-orange-700'
                }`}>
                  {formData.isActive ? 'La campagne est active et accepte les conversions' : 'La campagne est en pause'}
                </p>
              </div>
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>

            {/* Informations de base */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de la campagne</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Vente Été 2024"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Décrivez votre campagne..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="targetUrl">URL de destination</Label>
                <Input
                  id="targetUrl"
                  type="url"
                  value={formData.targetUrl}
                  onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                  placeholder="https://votresite.com/produit"
                  required
                />
                <p className="text-xs text-slate-500">
                  URL vers laquelle vos affiliés dirigeront le trafic
                </p>
              </div>
            </div>

            {/* Section des scripts de tracking */}
            <div className="border-t pt-6 mt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-slate-900 flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Scripts de tracking
                  </h3>
                  <p className="text-sm text-slate-600">
                    Copiez ces scripts pour intégrer le tracking dans votre site web.
                  </p>
                </div>

                {/* Script de tracking */}
                <div className="space-y-2">
                  <Label className="text-base font-medium">Script de tracking</Label>
                  <p className="text-sm text-muted-foreground">
                    Ajoutez ce code dans la section &lt;head&gt; de toutes les pages de votre site.
                  </p>
                  <div className="relative">
                    <Textarea 
                      value={trackingScript}
                      readOnly 
                      className="font-mono text-xs min-h-[120px] resize-none bg-slate-50"
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
                  <Label className="text-base font-medium">Code de conversion</Label>
                  <p className="text-sm text-muted-foreground">
                    Ajoutez ce code sur votre page de confirmation de commande pour tracker les conversions.
                  </p>
                  <div className="relative">
                    <Textarea 
                      value={conversionCode}
                      readOnly 
                      className="font-mono text-xs min-h-[140px] resize-none bg-slate-50"
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
              </div>
            </div>

            {/* Zone de danger */}
            <div className="border-t pt-6 mt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-red-900">Zone de danger</h3>
                  <p className="text-sm text-red-600">
                    Les actions suivantes sont irréversibles. Soyez prudent.
                  </p>
                </div>
                
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-red-900">Supprimer la campagne</h4>
                      <p className="text-sm text-red-600">
                        Cette action supprimera définitivement la campagne et tous ses affiliés.
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-white/95 backdrop-blur-xl border-slate-200">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer la campagne</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer la campagne "{campaign.name}" ? 
                            Cette action est irréversible et supprimera tous les affiliés et données associés.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {isDeleting ? "Suppression..." : "Supprimer"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
