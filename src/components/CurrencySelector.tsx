
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SUPPORTED_CURRENCIES, useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

interface CurrencySelectorProps {
  variant?: 'default' | 'dark';
}

export const CurrencySelector = ({ variant = 'default' }: CurrencySelectorProps) => {
  const { user } = useAuth();
  const { userCurrency } = useCurrencyFormatter();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const isDark = variant === 'dark';

  const updateCurrency = async (newCurrency: string) => {
    if (!user?.uid) return;
    
    try {
      setIsUpdating(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({ display_name: newCurrency }) // Temporary workaround
        .eq('id', user.uid);

      if (error) throw error;
      
      toast({
        title: 'Devise mise à jour',
        description: `La devise a été changée vers ${newCurrency}`,
      });
    } catch (error) {
      console.error('Erreur mise à jour devise:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la devise',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const currentCurrency = SUPPORTED_CURRENCIES[userCurrency];

  return (
    <div className="flex items-center">
      <Select value={userCurrency} onValueChange={updateCurrency} disabled={isUpdating}>
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
