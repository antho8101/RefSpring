
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useCookieConsent, CookiePreferences } from '@/hooks/useCookieConsent';
import { Cookie, Shield, BarChart, Target, User, Calendar, Info } from 'lucide-react';

interface CookiePreferencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CookiePreferencesDialog = ({ open, onOpenChange }: CookiePreferencesDialogProps) => {
  const { preferences, updatePreferences, acceptAll, acceptNecessaryOnly, getConsentTimestamp } = useCookieConsent();
  const [localPreferences, setLocalPreferences] = useState<CookiePreferences>(preferences);

  useEffect(() => {
    setLocalPreferences(preferences);
  }, [preferences]);

  const handleSave = () => {
    updatePreferences(localPreferences);
    onOpenChange(false);
  };

  const handleAcceptAll = () => {
    acceptAll();
    onOpenChange(false);
  };

  const handleNecessaryOnly = () => {
    acceptNecessaryOnly();
    onOpenChange(false);
  };

  const consentDate = getConsentTimestamp();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cookie className="h-5 w-5" />
            Préférences des cookies
          </DialogTitle>
          <DialogDescription>
            Gérez vos préférences de cookies. Vous pouvez modifier ces paramètres à tout moment.
            {consentDate && (
              <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                <Calendar className="h-3 w-3" />
                Dernière mise à jour : {consentDate.toLocaleDateString('fr-FR')}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Cookies nécessaires */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                <Label className="font-medium">Cookies nécessaires</Label>
              </div>
              <Switch checked={true} disabled />
            </div>
            <p className="text-sm text-slate-600 ml-6">
              Ces cookies sont essentiels au fonctionnement du site. Ils permettent des fonctionnalités de base comme la navigation, l'accès aux zones sécurisées et la mémorisation de vos préférences.
            </p>
            <div className="ml-6 text-xs text-slate-500">
              Exemples : authentification, panier, préférences de langue
            </div>
          </div>

          {/* Cookies d'analyse */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart className="h-4 w-4 text-blue-600" />
                <Label htmlFor="analytics" className="font-medium">Cookies d'analyse</Label>
              </div>
              <Switch
                id="analytics"
                checked={localPreferences.analytics}
                onCheckedChange={(checked) => 
                  setLocalPreferences(prev => ({ ...prev, analytics: checked }))
                }
              />
            </div>
            <p className="text-sm text-slate-600 ml-6">
              Ces cookies nous aident à comprendre comment vous utilisez notre site en collectant des informations anonymes sur votre navigation et vos interactions.
            </p>
            <div className="ml-6 text-xs text-slate-500">
              Services : Google Analytics, Hotjar, statistiques de performance
            </div>
          </div>

          {/* Cookies marketing */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-600" />
                <Label htmlFor="marketing" className="font-medium">Cookies marketing</Label>
              </div>
              <Switch
                id="marketing"
                checked={localPreferences.marketing}
                onCheckedChange={(checked) => 
                  setLocalPreferences(prev => ({ ...prev, marketing: checked }))
                }
              />
            </div>
            <p className="text-sm text-slate-600 ml-6">
              Ces cookies sont utilisés pour vous proposer des publicités pertinentes et mesurer l'efficacité de nos campagnes marketing sur différentes plateformes.
            </p>
            <div className="ml-6 text-xs text-slate-500">
              Services : Facebook Pixel, Google Ads, LinkedIn Insight Tag
            </div>
          </div>

          {/* Cookies de personnalisation */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-orange-600" />
                <Label htmlFor="personalization" className="font-medium">Cookies de personnalisation</Label>
              </div>
              <Switch
                id="personalization"
                checked={localPreferences.personalization}
                onCheckedChange={(checked) => 
                  setLocalPreferences(prev => ({ ...prev, personalization: checked }))
                }
              />
            </div>
            <p className="text-sm text-slate-600 ml-6">
              Ces cookies permettent de personnaliser votre expérience en mémorisant vos préférences et en adaptant le contenu à vos intérêts.
            </p>
            <div className="ml-6 text-xs text-slate-500">
              Fonctionnalités : recommandations, interface personnalisée, historique de navigation
            </div>
          </div>

          {/* Informations légales */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-900">Vos droits</span>
            </div>
            <p className="text-xs text-slate-600">
              Conformément au RGPD, vous avez le droit de retirer votre consentement à tout moment. 
              Vos préférences sont sauvegardées pour 1 an, après quoi nous vous demanderons à nouveau votre consentement.
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleNecessaryOnly} className="w-full sm:w-auto">
            Nécessaires uniquement
          </Button>
          <Button variant="outline" onClick={handleAcceptAll} className="w-full sm:w-auto">
            Accepter tout
          </Button>
          <Button onClick={handleSave} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
            Sauvegarder mes choix
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
