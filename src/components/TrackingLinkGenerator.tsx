
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, Copy, ExternalLink, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTrackingLinkGenerator } from '@/hooks/useTrackingLinkGenerator';
import { useState, useEffect } from 'react';

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

  useEffect(() => {
    const generateLink = async () => {
      if (!targetUrl) return;
      
      setLoading(true);
      try {
        const link = await generateTrackingLink(campaignId, affiliateId, targetUrl);
        setGeneratedLink(link);
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de générer le lien de tracking",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    generateLink();
  }, [campaignId, affiliateId, targetUrl, generateTrackingLink, toast]);

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
                Vos visiteurs seront automatiquement redirigés vers {targetUrl}
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
