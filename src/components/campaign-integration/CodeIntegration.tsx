import { useState } from 'react';
import { Campaign } from '@/types';
import { TrackingScriptSection } from '@/components/TrackingScriptSection';
import { ConversionCodeSection } from '@/components/ConversionCodeSection';
import { SecurityInfoSection } from '@/components/SecurityInfoSection';

interface CodeIntegrationProps {
  campaign: Campaign;
}

export const CodeIntegration = ({ campaign }: CodeIntegrationProps) => {
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());

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
    <div className="space-y-8">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-900">Scripts d'intégration</h3>
        <p className="text-slate-600">
          Copiez et collez ces scripts sur votre site marchand pour activer le tracking d'affiliation.
        </p>
      </div>

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
    </div>
  );
};