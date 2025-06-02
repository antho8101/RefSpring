
import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { useTracking } from '@/hooks/useTracking';

const TestThankYouPage = () => {
  const [searchParams] = useSearchParams();
  const { recordConversion } = useTracking();
  const [conversionRecorded, setConversionRecorded] = useState(false);
  
  const product = searchParams.get('product');
  const price = searchParams.get('price');
  const ref = searchParams.get('ref');
  const campaign = searchParams.get('campaign');

  const productNames = {
    'starter': 'Oridium Starter',
    'pro': 'Oridium Pro'
  };

  useEffect(() => {
    const handleConversion = async () => {
      if (!ref || !campaign || !price || conversionRecorded) {
        console.log('🎯 THANK YOU PAGE - Conditions pour conversion non remplies:', {
          ref, campaign, price, conversionRecorded
        });
        return;
      }

      console.log('💰 THANK YOU PAGE - Début enregistrement conversion');
      console.log('💰 Paramètres:', { ref, campaign, product, price });
      
      try {
        const amount = parseFloat(price);
        const commission = amount * 0.1; // 10% de commission
        
        console.log('💰 Calcul commission:', { amount, commission });
        
        const conversionId = await recordConversion(ref, campaign, amount, commission);
        
        if (conversionId) {
          console.log('✅ Conversion enregistrée avec succès:', conversionId);
          setConversionRecorded(true);
        } else {
          console.log('❌ Échec enregistrement conversion');
        }
      } catch (error) {
        console.error('❌ Erreur lors de l\'enregistrement de la conversion:', error);
      }
    };

    handleConversion();
  }, [ref, campaign, price, product, recordConversion, conversionRecorded]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="text-center">
          <CardHeader className="pb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-700">
              🎉 Merci pour votre achat !
            </CardTitle>
            <CardDescription className="text-lg">
              Votre commande a été confirmée avec succès
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Détails de la commande */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">📦 Détails de votre commande</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Produit:</span>
                  <span className="font-medium">
                    {product ? productNames[product as keyof typeof productNames] || product : 'Produit inconnu'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Prix:</span>
                  <span className="font-medium">{price ? `${price}€` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span className="font-medium">{new Date().toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            </div>

            {/* Informations d'affiliation */}
            {(ref || campaign) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-3">🎯 Tracking d'affiliation</h3>
                <div className="space-y-2 text-sm text-blue-700">
                  {ref && (
                    <div className="flex justify-between">
                      <span>Affilié:</span>
                      <span className="font-medium">{ref}</span>
                    </div>
                  )}
                  {campaign && (
                    <div className="flex justify-between">
                      <span>Campagne:</span>
                      <span className="font-medium">{campaign}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Commission (10%):</span>
                    <span className="font-medium">
                      {price ? `${(parseFloat(price) * 0.1).toFixed(2)}€` : 'N/A'}
                    </span>
                  </div>
                  {conversionRecorded && (
                    <div className="mt-2 p-2 bg-green-100 border border-green-300 rounded text-green-700 text-xs">
                      ✅ Conversion enregistrée dans le système !
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pas d'affiliation détectée */}
            {!ref && !campaign && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-medium text-orange-900 mb-2">⚠️ Aucune affiliation détectée</h3>
                <p className="text-sm text-orange-700">
                  Cette vente ne sera pas attribuée à un affilié car aucun paramètre de tracking n'a été détecté.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 space-y-3">
              <Button 
                onClick={() => window.location.href = '/test-products'}
                variant="outline" 
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à la boutique de test
              </Button>
              
              <Button 
                onClick={() => window.location.href = '/dashboard'}
                className="w-full"
              >
                Voir les statistiques dans le dashboard
              </Button>
            </div>

            {/* Section debug */}
            <div className="mt-6 p-3 bg-gray-100 rounded-lg text-left">
              <h4 className="font-medium text-gray-900 mb-2 text-sm">🔍 Debug - Paramètres reçus</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p><strong>URL:</strong> {window.location.href}</p>
                <p><strong>Produit:</strong> {product || 'Non spécifié'}</p>
                <p><strong>Prix:</strong> {price || 'Non spécifié'}</p>
                <p><strong>Ref:</strong> {ref || 'Non détecté'}</p>
                <p><strong>Campaign:</strong> {campaign || 'Non détecté'}</p>
                <p><strong>Conversion enregistrée:</strong> {conversionRecorded ? 'Oui' : 'Non'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestThankYouPage;
