
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useCurrencyFormatter, SUPPORTED_CURRENCIES } from '@/hooks/useCurrencyFormatter';
import { useExchangeRates } from '@/hooks/useExchangeRates';
import { useToast } from '@/hooks/use-toast';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { RefreshCw, TrendingUp } from 'lucide-react';

interface CurrencySettingsProps {
  onCancel: () => void;
}

export const CurrencySettings = ({ onCancel }: CurrencySettingsProps) => {
  const { user } = useAuth();
  const { userCurrency, formatCurrency } = useCurrencyFormatter();
  const { rates, loading: ratesLoading, lastUpdated, refreshRates } = useExchangeRates();
  const { toast } = useToast();
  const [selectedCurrency, setSelectedCurrency] = useState(userCurrency);
  const [saving, setSaving] = useState(false);

  const handleSaveCurrency = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        currency: selectedCurrency
      });

      toast({
        title: "Devise mise à jour",
        description: `Votre devise préférée a été changée vers ${SUPPORTED_CURRENCIES[selectedCurrency].name}`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour votre devise",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const previewAmount = 1234.56;

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-slate-900 mb-2">Devise préférée</h4>
        <p className="text-sm text-slate-600">
          Choisissez la devise dans laquelle vous souhaitez voir tous les montants affichés
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currency">Devise</Label>
          <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SUPPORTED_CURRENCIES).map(([code, info]) => (
                <SelectItem key={code} value={code}>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{info.symbol}</span>
                    <span>{info.name}</span>
                    <span className="text-slate-500 text-sm">({code})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Aperçu du formatage */}
        <div className="bg-slate-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-slate-900">Aperçu</span>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {formatCurrency(previewAmount, selectedCurrency)}
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Montant d'exemple avec votre devise sélectionnée
          </p>
        </div>

        {/* Statut des taux de change */}
        <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
          <div className="text-sm">
            <span className="font-medium text-blue-900">Taux de change:</span>
            <span className="text-blue-700 ml-2">
              {ratesLoading ? 'Mise à jour...' : 
               lastUpdated ? `Mis à jour ${lastUpdated.toLocaleTimeString()}` : 
               'Non disponible'}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshRates}
            disabled={ratesLoading}
            className="text-blue-600 hover:text-blue-700"
          >
            <RefreshCw className={`h-4 w-4 ${ratesLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="flex gap-3">
        <Button 
          onClick={handleSaveCurrency} 
          disabled={saving || selectedCurrency === userCurrency}
        >
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </div>
  );
};
