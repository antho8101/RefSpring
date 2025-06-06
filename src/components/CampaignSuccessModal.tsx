
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { PublicDashboardSection } from './PublicDashboardSection';
import { TrackingScriptSection } from './TrackingScriptSection';
import { ConversionCodeSection } from './ConversionCodeSection';
import { SecurityInfoSection } from './SecurityInfoSection';
import { NextStepsSection } from './NextStepsSection';

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

  // Utilise l'URL actuelle au lieu d'une URL codée en dur
  const publicDashboardUrl = `${window.location.origin}/r/${campaignId}`;
  
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
    // Le système attribue automatiquement au bon affilié
    RefSpring.trackConversion(99.99); // Remplacez par le montant réel
  }
</script>

<!-- Exemple avec ID de commande (optionnel) -->
<script>
  if (typeof RefSpring !== 'undefined') {
    RefSpring.trackConversion(149.50); // Pour une commande de 149,50€
    
    // Les données d'affiliation sont automatiquement récupérées
    // Pas besoin de spécifier campaignId ou affiliateId
  }
</script>`;

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
          <PublicDashboardSection 
            publicDashboardUrl={publicDashboardUrl}
            copiedItems={copiedItems}
            setCopiedItems={setCopiedItems}
          />

          <TrackingScriptSection 
            trackingScript={trackingScript}
            copiedItems={copiedItems}
            setCopiedItems={setCopiedItems}
          />

          <ConversionCodeSection 
            conversionCode={conversionCode}
            copiedItems={copiedItems}
            setCopiedItems={setCopiedItems}
          />

          <SecurityInfoSection />

          <NextStepsSection />
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>
            Terminer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
