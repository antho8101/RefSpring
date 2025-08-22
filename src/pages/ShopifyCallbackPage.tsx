import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { CheckCircle, XCircle, ShoppingBag } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const ShopifyCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const shop = searchParams.get('shop');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(`Shopify error: ${error}`);
        }

        if (!code || !state || !shop) {
          throw new Error('Paramètres OAuth manquants');
        }

        // Récupérer les données stockées en session
        const storedData = sessionStorage.getItem('shopify_oauth_state');
        if (!storedData) {
          throw new Error('Session expirée, veuillez recommencer l\'installation');
        }

        const { campaignId } = JSON.parse(storedData);

        // Finaliser l'installation avec Supabase
        const response = await fetch('https://wsvhmozduyiftmuuynpi.supabase.co/functions/v1/shopify-callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indzdmhtb3pkdXlpZnRtdXV5bnBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NDQ3OTEsImV4cCI6MjA3MTQyMDc5MX0.eLzX-f5tIJvbqBLB1lbSM0ex1Rz1p6Izemi0NnqiWz4`
          },
          body: JSON.stringify({
            shop,
            code,
            state
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Échec de l\'installation');
        }

        const result = await response.json();

        setStatus('success');
        setMessage(`L'app RefSpring a été installée avec succès sur ${result.shopInfo?.name || shop}!`);

        // Nettoyer le sessionStorage
        sessionStorage.removeItem('shopify_oauth_state');

        // Rediriger vers le dashboard après 3 secondes
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);

        toast({
          title: "Installation réussie !",
          description: "L'app Shopify RefSpring est maintenant active",
        });

      } catch (error) {
        console.error('Erreur callback Shopify:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Erreur inconnue');

        toast({
          title: "Erreur d'installation",
          description: "Impossible de finaliser l'installation Shopify",
          variant: "destructive"
        });
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  const handleRetry = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-purple-100">
            <ShoppingBag className="h-8 w-8 text-purple-600" />
          </div>
          <CardTitle className="text-xl">Installation Shopify</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === 'loading' && (
            <>
              <LoadingSpinner size="lg" />
              <p className="text-muted-foreground">
                Finalisation de l'installation...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-600 mb-2">Installation réussie !</h3>
                <p className="text-sm text-muted-foreground">
                  {message}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Redirection automatique vers le dashboard...
                </p>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-red-600 mb-2">Erreur d'installation</h3>
                <p className="text-sm text-muted-foreground">
                  {message}
                </p>
              </div>
              <Button onClick={handleRetry} className="w-full">
                Retour au dashboard
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};