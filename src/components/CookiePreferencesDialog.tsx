
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useCookieConsent, CookiePreferences } from '@/hooks/useCookieConsent';
import { Cookie, Shield, BarChart, Target } from 'lucide-react';

interface CookiePreferencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CookiePreferencesDialog = ({ open, onOpenChange }: CookiePreferencesDialogProps) => {
  const { preferences, updatePreferences, acceptAll, acceptNecessaryOnly } = useCookieConsent();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cookie className="h-5 w-5" />
            Préférences des cookies
          </DialogTitle>
          <DialogDescription>
            Gérez vos préférences de cookies. Vous pouvez modifier ces paramètres à tout moment.
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
              Ces cookies sont essentiels au fonctionnement du site. Ils permettent des fonctionnalités de base comme la navigation et l'accès aux zones sécurisées.
            </p>
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
              Ces cookies nous aident à comprendre comment vous utilisez notre site en collectant des informations anonymes sur votre navigation.
            </p>
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
              Ces cookies sont utilisés pour vous proposer des publicités pertinentes et mesurer l'efficacité de nos campagnes marketing.
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
