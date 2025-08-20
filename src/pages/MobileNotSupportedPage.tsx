import { RefSpringLogo } from '@/components/RefSpringLogo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor, Smartphone, Tablet } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const MobileNotSupportedPage = () => {
  return (
    <>
      <Helmet>
        <title>RefSpring - Version Desktop Requise</title>
        <meta name="description" content="RefSpring nécessite un ordinateur de bureau pour une expérience optimale." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader className="space-y-6">
            <div className="flex justify-center">
              <RefSpringLogo className="h-12 w-auto" />
            </div>
            
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold text-foreground">
                Version Desktop Requise
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                RefSpring est optimisé pour les ordinateurs de bureau
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="flex justify-center space-x-4 text-muted-foreground">
              <div className="flex flex-col items-center space-y-2">
                <Smartphone className="h-8 w-8 opacity-50" />
                <span className="text-xs">Mobile</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <Tablet className="h-8 w-8 opacity-50" />
                <span className="text-xs">Tablette</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <Monitor className="h-8 w-8 text-primary" />
                <span className="text-xs font-medium text-primary">Desktop</span>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground space-y-3">
              <p>
                Notre tableau de bord nécessite un écran plus large pour afficher 
                toutes les données et fonctionnalités de manière optimale.
              </p>
              <p className="font-medium text-foreground">
                Veuillez utiliser un ordinateur de bureau ou portable pour accéder à RefSpring.
              </p>
            </div>
            
            <div className="pt-4">
              <Button 
                onClick={() => window.location.href = '/'}
                className="w-full"
              >
                Retour à l'accueil
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default MobileNotSupportedPage;