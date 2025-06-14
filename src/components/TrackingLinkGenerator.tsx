
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, Copy, ExternalLink, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTrackingLinkGenerator } from '@/hooks/useTrackingLinkGenerator';
import { useState, useEffect, useRef } from 'react';

interface TrackingLinkGeneratorProps {
  campaignId: string;
  affiliateId: string;
  targetUrl: string;
}

export const TrackingLinkGenerator = ({ campaignId, affiliateId, targetUrl }: TrackingLinkGeneratorProps) => {
  const { toast } = useToast();
  const { generateTrackingLink } = useTrackingLinkGenerator();
  const [generatedLink, setGeneratedLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isGeneratingRef = useRef(false);

  // CORRECTION: Réinitialiser le lien quand l'affilié ou la campagne change
  useEffect(() => {
    console.log('🔄 TRACKING LINK GENERATOR - Paramètres changés, réinitialisation du lien');
    setGeneratedLink('');
    setError(null);
    isGeneratingRef.current = false;
  }, [campaignId, affiliateId]);

  useEffect(() => {
    const generateLink = async () => {
      if (!targetUrl) {
        console.log('⚠️ TRACKING LINK GENERATOR - Pas d\'URL cible');
        return;
      }

      // Éviter les générations multiples simultanées
      if (isGeneratingRef.current) {
        console.log('⚠️ TRACKING LINK GENERATOR - Génération déjà en cours, ignoré');
        return;
      }

      // Si on a déjà un lien généré pour ces paramètres, on évite de regénérer
      if (generatedLink) {
        console.log('⚠️ TRACKING LINK GENERATOR - Lien déjà généré, ignoré');
        return;
      }
      
      console.log('🚀 TRACKING LINK GENERATOR - Début génération');
      console.log('🚀 Paramètres:', { campaignId, affiliateId, targetUrl });
      
      isGeneratingRef.current = true;
      setLoading(true);
      setError(null);
      
      try {
        console.log('⏳ TRACKING LINK GENERATOR - Appel generateTrackingLink...');
        const link = await generateTrackingLink(campaignId, affiliateId, targetUrl);
        console.log('✅ TRACKING LINK GENERATOR - Lien généré:', link);
        
        // Vérifier que le lien généré est bien un lien court
        if (link.length > 100) {
          throw new Error('Le lien généré est trop long, échec du raccourcissement');
        }
        
        setGeneratedLink(link);
        setError(null);
      } catch (error) {
        console.error('❌ TRACKING LINK GENERATOR - Erreur:', error);
        const errorMessage = error instanceof Error ? error.message : 'Impossible de générer le lien de tracking';
        setError(errorMessage);
        toast({
          title: "Erreur de génération",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        console.log('🏁 TRACKING LINK GENERATOR - Fin (loading = false)');
        setLoading(false);
        isGeneratingRef.current = false;
      }
    };

    generateLink();
  }, [campaignId, affiliateId, targetUrl, generatedLink, generateTrackingLink, toast]);

  const copyLink = async () => {
    if (!generatedLink) return;
    
    try {
      await navigator.clipboard.writeText(generatedLink);
      toast({
        title: "Lien copié !",
        description: "Le lien de tracking a été copié dans le presse-papiers",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien",
        variant: "destructive",
      });
    }
  };

  const testLink = () => {
    if (generatedLink) {
      window.open(generatedLink, '_blank');
    }
  };

  const retryGeneration = () => {
    setGeneratedLink('');
    setError(null);
    isGeneratingRef.current = false;
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link className="h-5 w-5" />
          Votre lien de tracking
        </CardTitle>
        <CardDescription>
          Ce lien redirige automatiquement vers : <strong>{targetUrl}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <p className="text-sm text-blue-700">Génération de votre lien court...</p>
          </div>
        ) : error ? (
          <div className="space-y-3">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-red-700 font-medium">Erreur de génération</p>
                  <p className="text-xs text-red-600 mt-1">{error}</p>
                </div>
              </div>
            </div>
            <Button onClick={retryGeneration} size="sm" variant="outline">
              Réessayer
            </Button>
          </div>
        ) : generatedLink ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={generatedLink}
                readOnly
                className="font-mono text-sm"
              />
              <Button onClick={copyLink} size="sm">
                <Copy className="h-4 w-4" />
              </Button>
              <Button onClick={testLink} size="sm" variant="outline">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-700">
                ✅ <strong>Lien court prêt !</strong> Partagez ce lien pour tracker vos conversions.
              </p>
              <p className="text-xs text-green-600 mt-1">
                Longueur: {generatedLink.length} caractères - Vos visiteurs seront automatiquement redirigés vers {targetUrl}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-sm text-orange-700">
              ⚠️ URL de destination manquante dans la configuration de la campagne
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
