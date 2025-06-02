
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star } from 'lucide-react';

const TestProductsPage = () => {
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref');
  const campaign = searchParams.get('campaign');

  console.log('📦 TEST PRODUCTS PAGE - Paramètres détectés:', { ref, campaign });

  const handlePurchase = (productId: string, price: number) => {
    console.log('🛒 Achat produit:', { productId, price, ref, campaign });
    
    // Construire l'URL de remerciement avec tous les paramètres
    const thankYouUrl = new URL('/test-thankyou', window.location.origin);
    thankYouUrl.searchParams.set('product', productId);
    thankYouUrl.searchParams.set('price', price.toString());
    
    if (ref) thankYouUrl.searchParams.set('ref', ref);
    if (campaign) thankYouUrl.searchParams.set('campaign', campaign);
    
    console.log('🎯 Redirection vers:', thankYouUrl.toString());
    window.location.href = thankYouUrl.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Page de Test - Boutique Oridium
          </h1>
          <p className="text-gray-600">
            Page de test pour valider le système de tracking d'affiliation
          </p>
          
          {/* Affichage des paramètres d'affiliation détectés */}
          {(ref || campaign) && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg inline-block">
              <p className="text-sm text-green-700">
                ✅ <strong>Affiliation détectée !</strong>
              </p>
              {ref && <p className="text-xs text-green-600">Affilié: {ref}</p>}
              {campaign && <p className="text-xs text-green-600">Campagne: {campaign}</p>}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Produit 1 - Moins cher */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="aspect-video bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                <ShoppingCart className="h-16 w-16 text-white" />
              </div>
              <CardTitle className="text-xl">Oridium Starter</CardTitle>
              <CardDescription>
                Package d'entrée parfait pour débuter avec Oridium
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm text-gray-600">(127 avis)</span>
                </div>
                
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Accès de base à la plateforme</li>
                  <li>• Support email</li>
                  <li>• 5 projets inclus</li>
                  <li>• Documentation complète</li>
                </ul>
                
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">29€</span>
                      <span className="text-gray-600 ml-1">/mois</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handlePurchase('starter', 29)}
                    className="w-full"
                    size="lg"
                  >
                    Acheter Starter - 29€
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Produit 2 - Plus cher */}
          <Card className="hover:shadow-lg transition-shadow border-2 border-blue-200 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                ⭐ Populaire
              </span>
            </div>
            <CardHeader>
              <div className="aspect-video bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <ShoppingCart className="h-16 w-16 text-white" />
              </div>
              <CardTitle className="text-xl">Oridium Pro</CardTitle>
              <CardDescription>
                Solution complète pour les professionnels et équipes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm text-gray-600">(89 avis)</span>
                </div>
                
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Accès premium à toutes les fonctionnalités</li>
                  <li>• Support prioritaire 24/7</li>
                  <li>• Projets illimités</li>
                  <li>• API avancée incluse</li>
                  <li>• Formation personnalisée</li>
                </ul>
                
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">99€</span>
                      <span className="text-gray-600 ml-1">/mois</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-green-600 font-medium">Économisez 30€</div>
                      <div className="text-xs text-gray-500 line-through">129€</div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handlePurchase('pro', 99)}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    size="lg"
                  >
                    Acheter Pro - 99€
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section de debug */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">🔍 Debug - Paramètres URL</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>URL actuelle:</strong> {window.location.href}</p>
            <p><strong>Paramètre 'ref':</strong> {ref || 'Non détecté'}</p>
            <p><strong>Paramètre 'campaign':</strong> {campaign || 'Non détecté'}</p>
            <p className="text-xs text-gray-500 mt-2">
              💡 Les paramètres d'affiliation seront transmis à la page de remerciement
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestProductsPage;
