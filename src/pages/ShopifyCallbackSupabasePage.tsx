import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { CheckCircle, XCircle, ShoppingBag } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useShopifySupabase } from '@/hooks/useShopifySupabase';

export const ShopifyCallbackSupabasePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  
  // Récupérer campaignId depuis sessionStorage ou URL (plus nécessaire avec Private Apps)
  const { finalizeShopifyInstall } = useShopifySupabase();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const shop = searchParams.get('shop');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(`Erreur Shopify: ${error}`);
        }

        if (!code || !state || !shop) {
          throw new Error('Paramètres OAuth manquants');
        }

        // Finaliser l'installation via Supabase
        const integration = await finalizeShopifyInstall(code, state, shop);

        setStatus('success');
        setMessage(`Shopify connecté avec succès pour ${integration.shopInfo.name}!`);

        // Nettoyer le sessionStorage
        sessionStorage.removeItem('shopify_campaign_id');

        // Rediriger vers le dashboard après 3 secondes
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);

        toast({
          title: "Connexion réussie !",
          description: "Votre boutique Shopify est maintenant connectée",
        });

      } catch (error) {
        console.error('Erreur callback Shopify:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Erreur inconnue');

        toast({
          title: "Erreur de connexion",
          description: "Impossible de finaliser la connexion Shopify",
          variant: "destructive"
        });
      }
    };

    handleCallback();
  }, [searchParams, navigate, finalizeShopifyInstall]);

  const handleRetry = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-green-100">
            <ShoppingBag className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-xl">Connexion Shopify</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === 'loading' && (
            <>
              <LoadingSpinner size="lg" />
              <p className="text-muted-foreground">
                Finalisation de la connexion...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-600 mb-2">Connexion réussie !</h3>
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
                <h3 className="font-semibold text-red-600 mb-2">Erreur de connexion</h3>
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