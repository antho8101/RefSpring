import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCookieConsent, CookiePreferences, CookieOptions } from '@/hooks/useCookieConsent';
import { Shield, Cookie, Database, Clock, AlertTriangle, Download, Trash2, Eye, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const PrivacyDashboard = () => {
  const { 
    preferences, 
    options,
    updatePreferences, 
    resetConsent, 
    getConsentTimestamp, 
    getExpiryDate 
  } = useCookieConsent();
  
  const [localPreferences, setLocalPreferences] = useState<CookiePreferences>(preferences);
  const [localOptions, setLocalOptions] = useState<CookieOptions>(options);
  const [showDataExport, setShowDataExport] = useState(false);
  const [showDataDeletion, setShowDataDeletion] = useState(false);

  const consentDate = getConsentTimestamp();
  const expiryDate = getExpiryDate();

  const handleSavePreferences = () => {
    updatePreferences(localPreferences, localOptions);
  };

  const handleExportData = () => {
    const data = {
      consentTimestamp: consentDate?.toISOString(),
      preferences: preferences,
      options: options,
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `refspring-privacy-data-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const cookieCategories = [
    {
      key: 'necessary' as keyof CookiePreferences,
      title: 'Cookies Nécessaires',
      description: 'Essentiels au fonctionnement du site',
      icon: Shield,
      required: true,
      examples: ['Authentification', 'Sécurité', 'Navigation'],
    },
    {
      key: 'analytics' as keyof CookiePreferences,
      title: 'Cookies Analytiques',
      description: 'Nous aident à comprendre l\'usage du site',
      icon: Database,
      required: false,
      examples: ['Google Analytics', 'Hotjar', 'Statistiques'],
    },
    {
      key: 'marketing' as keyof CookiePreferences,
      title: 'Cookies Marketing',
      description: 'Personnalisent la publicité',
      icon: Eye,
      required: false,
      examples: ['Facebook Pixel', 'Google Ads', 'Retargeting'],
    },
    {
      key: 'personalization' as keyof CookiePreferences,
      title: 'Cookies Personnalisation',
      description: 'Améliorent votre expérience',
      icon: Settings,
      required: false,
      examples: ['Préférences UI', 'Recommandations', 'Langue'],
    },
  ];

  return (
    <div className="space-y-6">
      {/* En-tête du tableau de bord */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Tableau de Bord Confidentialité</CardTitle>
              <CardDescription>
                Gérez vos données personnelles et préférences de confidentialité
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Consentement donné</p>
              <p className="text-xs text-muted-foreground">
                {consentDate ? format(consentDate, 'dd MMMM yyyy', { locale: fr }) : 'Jamais'}
              </p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <AlertTriangle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Expire le</p>
              <p className="text-xs text-muted-foreground">
                {expiryDate ? format(expiryDate, 'dd MMMM yyyy', { locale: fr }) : 'Jamais'}
              </p>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Cookie className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Cookies actifs</p>
              <p className="text-xs text-muted-foreground">
                {Object.values(preferences).filter(Boolean).length} / {Object.keys(preferences).length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gestion des cookies par catégorie */}
      <Card>
        <CardHeader>
          <CardTitle>Préférences des Cookies</CardTitle>
          <CardDescription>
            Contrôlez quels types de cookies vous souhaitez autoriser
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {cookieCategories.map((category, index) => (
            <div key={category.key}>
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <category.icon className="h-5 w-5 mt-1 text-muted-foreground" />
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{category.title}</h3>
                      {category.required && (
                        <Badge variant="secondary" className="text-xs">
                          Requis
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {category.examples.map((example) => (
                        <Badge key={example} variant="outline" className="text-xs">
                          {example}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <Switch
                  checked={localPreferences[category.key]}
                  onCheckedChange={(checked) =>
                    setLocalPreferences(prev => ({
                      ...prev,
                      [category.key]: checked
                    }))
                  }
                  disabled={category.required}
                />
              </div>
              {index < cookieCategories.length - 1 && <Separator className="mt-6" />}
            </div>
          ))}
          
          <div className="pt-4 space-y-4">
            <Separator />
            <div className="space-y-4">
              <h3 className="font-medium">Options Avancées</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Mode Strict</p>
                  <p className="text-xs text-muted-foreground">
                    Bloque automatiquement les nouveaux cookies
                  </p>
                </div>
                <Switch
                  checked={localOptions.strictMode}
                  onCheckedChange={(checked) =>
                    setLocalOptions(prev => ({ ...prev, strictMode: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Expiration Automatique</p>
                  <p className="text-xs text-muted-foreground">
                    Redemander le consentement après 1 an
                  </p>
                </div>
                <Switch
                  checked={localOptions.autoExpiry}
                  onCheckedChange={(checked) =>
                    setLocalOptions(prev => ({ ...prev, autoExpiry: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Opt-out du Tracking</p>
                  <p className="text-xs text-muted-foreground">
                    Envoie le signal "Do Not Track"
                  </p>
                </div>
                <Switch
                  checked={localOptions.trackingOptOut}
                  onCheckedChange={(checked) =>
                    setLocalOptions(prev => ({ ...prev, trackingOptOut: checked }))
                  }
                />
              </div>
            </div>
            
            <Button onClick={handleSavePreferences} className="w-full">
              Sauvegarder les Préférences
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Actions sur les données */}
      <Card>
        <CardHeader>
          <CardTitle>Vos Droits sur les Données</CardTitle>
          <CardDescription>
            Exercez vos droits RGPD concernant vos données personnelles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Dialog open={showDataExport} onOpenChange={setShowDataExport}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Download className="h-6 w-6" />
                  <div className="text-center">
                    <p className="font-medium">Exporter mes données</p>
                    <p className="text-xs text-muted-foreground">Télécharger vos données</p>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Exporter vos données</DialogTitle>
                  <DialogDescription>
                    Téléchargez toutes les données que nous avons collectées à votre sujet.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Le fichier contiendra vos préférences de confidentialité et métadonnées de consentement.
                    </AlertDescription>
                  </Alert>
                  <Button onClick={handleExportData} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger mes données
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showDataDeletion} onOpenChange={setShowDataDeletion}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Trash2 className="h-6 w-6" />
                  <div className="text-center">
                    <p className="font-medium">Supprimer mes données</p>
                    <p className="text-xs text-muted-foreground">Droit à l'effacement</p>
                  </div>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Supprimer vos données</DialogTitle>
                  <DialogDescription>
                    Cette action supprimera toutes vos préférences de confidentialité.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Attention : Cette action est irréversible. Vos préférences seront perdues.
                    </AlertDescription>
                  </Alert>
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      resetConsent();
                      setShowDataDeletion(false);
                    }}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Confirmer la suppression
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Shield className="h-6 w-6" />
              <div className="text-center">
                <p className="font-medium">Nous contacter</p>
                <p className="text-xs text-muted-foreground">Questions sur vos données</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};