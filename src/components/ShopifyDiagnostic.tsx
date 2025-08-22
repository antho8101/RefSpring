import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

export const ShopifyDiagnostic: React.FC = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { user } = useAuth();

  const runDiagnostic = async () => {
    setIsRunning(true);
    const diagnosticResults: DiagnosticResult[] = [];

    try {
      // Test 1: Vérifier l'authentification utilisateur
      if (!user) {
        diagnosticResults.push({
          test: 'Authentification utilisateur',
          status: 'error',
          message: 'Utilisateur non connecté'
        });
      } else {
        diagnosticResults.push({
          test: 'Authentification utilisateur',
          status: 'success',
          message: 'Utilisateur connecté',
          details: `UID: ${user.uid}`
        });
      }

      // Test 2: Vérifier les intégrations Shopify existantes
      try {
        const { data: integrations, error: integrationsError } = await supabase
          .from('shopify_integrations')
          .select('*')
          .eq('user_id', user?.uid)
          .eq('active', true);

        if (integrationsError) throw integrationsError;

        if (!integrations || integrations.length === 0) {
          diagnosticResults.push({
            test: 'Intégrations Shopify',
            status: 'warning',
            message: 'Aucune intégration active trouvée'
          });
        } else {
          diagnosticResults.push({
            test: 'Intégrations Shopify',
            status: 'success',
            message: `${integrations.length} intégration(s) trouvée(s)`,
            details: integrations.map(i => i.shop_domain).join(', ')
          });

          // Test 3: Vérifier les tokens pour chaque intégration
          for (const integration of integrations) {
            try {
              // Test simple d'accès API via edge function
              const { data: shopTest, error: shopTestError } = await supabase.functions.invoke('shopify-test-api', {
                body: { 
                  shopDomain: integration.shop_domain,
                  accessToken: integration.access_token 
                }
              });

              if (shopTestError) throw shopTestError;

              if (shopTest?.success) {
                diagnosticResults.push({
                  test: `API Access - ${integration.shop_domain}`,
                  status: 'success',
                  message: 'Accès API fonctionnel'
                });
              } else {
                diagnosticResults.push({
                  test: `API Access - ${integration.shop_domain}`,
                  status: 'error',
                  message: 'Accès API bloqué',
                  details: shopTest?.error || 'Token invalide ou expiré'
                });
              }
            } catch (error) {
              diagnosticResults.push({
                test: `API Access - ${integration.shop_domain}`,
                status: 'error',
                message: 'Erreur de connexion API',
                details: error.message
              });
            }
          }
        }
      } catch (error) {
        diagnosticResults.push({
          test: 'Intégrations Shopify',
          status: 'error',
          message: 'Erreur accès base de données',
          details: error.message
        });
      }

      // Test 4: Vérifier les clés API Shopify
      try {
        const { data: configTest, error: configError } = await supabase.functions.invoke('shopify-config-test');
        
        if (configError) throw configError;

        if (configTest?.apiKeyConfigured) {
          diagnosticResults.push({
            test: 'Configuration API Shopify',
            status: 'success',
            message: 'Clés API configurées'
          });
        } else {
          diagnosticResults.push({
            test: 'Configuration API Shopify',
            status: 'error',
            message: 'Clés API manquantes ou invalides'
          });
        }
      } catch (error) {
        diagnosticResults.push({
          test: 'Configuration API Shopify',
          status: 'error',
          message: 'Impossible de vérifier la configuration',
          details: error.message
        });
      }

    } catch (error) {
      console.error('Erreur diagnostic:', error);
      toast({
        title: "Erreur diagnostic",
        description: "Impossible de terminer le diagnostic",
        variant: "destructive"
      });
    }

    setResults(diagnosticResults);
    setIsRunning(false);
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">OK</Badge>;
      case 'error':
        return <Badge variant="destructive">ERREUR</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">ATTENTION</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-blue-600" />
            <span>Diagnostic Shopify API</span>
          </CardTitle>
          <Button 
            onClick={runDiagnostic} 
            disabled={isRunning}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
            <span>Lancer diagnostic</span>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {results.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Cliquez sur "Lancer diagnostic" pour vérifier l'état de votre configuration Shopify
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                <div className="flex-shrink-0 mt-0.5">
                  {getStatusIcon(result.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{result.test}</h4>
                    {getStatusBadge(result.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{result.message}</p>
                  {result.details && (
                    <p className="text-xs text-muted-foreground mt-1 font-mono bg-gray-50 p-2 rounded">
                      {result.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};