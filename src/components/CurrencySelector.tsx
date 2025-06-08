
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SUPPORTED_CURRENCIES, useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useState } from 'react';

interface CurrencySelectorProps {
  variant?: 'default' | 'dark';
}

export const CurrencySelector = ({ variant = 'default' }: CurrencySelectorProps) => {
  const { user } = useAuth();
  const { userCurrency } = useCurrencyFormatter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const isDark = variant === 'dark';

  const handleCurrencyChange = async (newCurrency: string) => {
    if (!user || newCurrency === userCurrency) {
      return;
    }

    setLoading(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        currency: newCurrency
      });

      toast({
        title: "Devise mise à jour",
        description: `Votre devise a été changée vers ${SUPPORTED_CURRENCIES[newCurrency].name}`,
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

  const currentCurrency = SUPPORTED_CURRENCIES[userCurrency];

  return (
    <div className="flex items-center">
      <Select value={userCurrency} onValueChange={handleCurrencyChange} disabled={loading}>
        <SelectTrigger className={`w-[140px] touch-select no-touch-highlight ${isDark ? 'border-slate-600 bg-slate-800 text-white' : 'border-slate-200'}`}>
          <SelectValue>
            <div className="flex items-center gap-2">
              <span>{currentCurrency?.symbol}</span>
              <span className="text-sm">{currentCurrency?.code}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-white border border-slate-200 shadow-lg z-50 touch-scroll">
          {Object.entries(SUPPORTED_CURRENCIES).map(([code, info]) => (
            <SelectItem key={code} value={code} className="hover:bg-slate-50 touch-menu-item no-touch-highlight">
              <div className="flex items-center gap-2">
                <span className="font-medium">{info.symbol}</span>
                <span>{info.name}</span>
                <span className="text-sm text-slate-500">({code})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
