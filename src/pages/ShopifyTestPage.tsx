import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShopifyTestComponent } from '@/components/ShopifyTestComponent';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const ShopifyTestPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour au Dashboard</span>
          </Button>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Test Intégration Shopify - Supabase</CardTitle>
              <p className="text-muted-foreground">
                Interface de test pour l'intégration Shopify avec Supabase
              </p>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-medium text-blue-900 mb-2">Instructions de test :</h3>
                <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                  <li>Cliquez sur "Ajouter Shopify" pour commencer l'intégration</li>
                  <li>Entrez le nom d'une boutique Shopify (test ou réelle)</li>
                  <li>Vous serez redirigé vers Shopify pour l'autorisation</li>
                  <li>Après autorisation, retour automatique et sauvegarde en base</li>
                  <li>L'intégration apparaîtra dans la liste ci-dessous</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          <ShopifyTestComponent campaignId="test-campaign-123" />
        </div>
      </div>
    </div>
  );
};