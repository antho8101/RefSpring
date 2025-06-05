
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { Link } from 'react-router-dom';
import { Cookie, Settings } from 'lucide-react';
import { useState } from 'react';
import { CookiePreferencesDialog } from '@/components/CookiePreferencesDialog';

export const CookieBanner = () => {
  const { showBanner, acceptAll, acceptNecessaryOnly } = useCookieConsent();
  const [showPreferences, setShowPreferences] = useState(false);

  if (!showBanner) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-black/50 backdrop-blur-sm">
        <Card className="max-w-4xl mx-auto p-6 bg-white shadow-xl border border-slate-200">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex items-start gap-3 flex-1">
              <Cookie className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-900">
                  Respect de votre vie privée
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic et personnaliser le contenu. 
                  En cliquant sur "Accepter tout", vous consentez à l'utilisation de tous les cookies. 
                  Vous pouvez modifier vos préférences à tout moment.
                </p>
                <div className="flex gap-4 text-xs">
                  <Link to="/privacy" className="text-blue-600 hover:underline">
                    Politique de confidentialité
                  </Link>
                  <Link to="/legal" className="text-blue-600 hover:underline">
                    Mentions légales
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 lg:flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreferences(true)}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Personnaliser
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={acceptNecessaryOnly}
              >
                Nécessaires uniquement
              </Button>
              <Button
                size="sm"
                onClick={acceptAll}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Accepter tout
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <CookiePreferencesDialog 
        open={showPreferences} 
        onOpenChange={setShowPreferences} 
      />
    </>
  );
};
