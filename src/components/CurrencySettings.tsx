
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { SUPPORTED_CURRENCIES, useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CurrencySettingsProps {
  onCancel: () => void;
}

export const CurrencySettings = ({ onCancel }: CurrencySettingsProps) => {
  const { user } = useAuth();
  const { userCurrency } = useCurrencyFormatter();
  const { toast } = useToast();
  const [selectedCurrency, setSelectedCurrency] = useState(userCurrency);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!user || selectedCurrency === userCurrency) {
      onCancel();
      return;
    }

    setLoading(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        currency: selectedCurrency
      });

      toast({
        title: "Devise mise à jour",
        description: `Votre devise a été changée vers ${SUPPORTED_CURRENCIES[selectedCurrency].name}`,
      });

      // Recharger la page pour appliquer le changement
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la devise",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-slate-900">Devise préférée</h4>
        <p className="text-sm text-slate-600">
          Choisissez la devise dans laquelle vous souhaitez afficher les montants.
          Les taux de change sont mis à jour automatiquement.
        </p>
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="currency">Devise</Label>
        <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
          <SelectTrigger className="max-w-md">
            <SelectValue placeholder="Sélectionnez une devise" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-slate-200 shadow-lg">
            {Object.entries(SUPPORTED_CURRENCIES).map(([code, info]) => (
              <SelectItem key={code} value={code} className="hover:bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{info.symbol}</span>
                  <span>{info.name}</span>
                  <span className="text-sm text-slate-500">({code})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {selectedCurrency !== userCurrency && (
          <p className="text-sm text-amber-600">
            ⚠️ Les montants seront convertis automatiquement selon les taux de change actuels.
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <Button 
          onClick={handleSave} 
          disabled={loading || selectedCurrency === userCurrency}
        >
          {loading ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </div>
  );
};
