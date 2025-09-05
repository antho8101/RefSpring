
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, Plus, Check } from 'lucide-react';
import { PaymentMethod } from '@/services/paymentMethodService';
import { Badge } from '@/components/ui/badge';

interface PaymentMethodSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentMethods: PaymentMethod[];
  onSelectCard: (cardId: string) => void;
  onAddNewCard: () => void;
  loading?: boolean;
}

export const PaymentMethodSelector = ({
  open,
  onOpenChange,
  paymentMethods,
  onSelectCard,
  onAddNewCard,
  loading = false
}: PaymentMethodSelectorProps) => {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // Si aucune carte n'est disponible et le dialog s'ouvre, rediriger vers l'ajout d'une nouvelle carte
  useEffect(() => {
    if (open && paymentMethods.length === 0 && !loading) {
      onOpenChange(false); // Fermer le dialog
      onAddNewCard(); // Rediriger vers l'ajout d'une nouvelle carte
    }
  }, [open, paymentMethods.length, loading, onOpenChange, onAddNewCard]);

  // Ne pas afficher le dialog s'il n'y a pas de cartes
  if (paymentMethods.length === 0) {
    return null;
  }

  const handleSelectCard = (cardId: string) => {
    setSelectedCardId(cardId);
  };

  const handleConfirm = () => {
    if (selectedCardId) {
      onSelectCard(selectedCardId);
    }
  };

  const getCardIcon = (brand: string) => {
    return <CreditCard className="h-5 w-5" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choisir une carte de paiement</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Sélectionnez une carte existante ou ajoutez-en une nouvelle pour cette campagne.
          </p>
          
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {paymentMethods.map((card) => (
              <Card 
                key={card.id}
                className={`cursor-pointer transition-all ${
                  selectedCardId === card.id 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:bg-slate-50'
                }`}
                onClick={() => handleSelectCard(card.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getCardIcon(card.brand)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="capitalize font-medium">{card.brand}</span>
                          <span>•••• {card.last4}</span>
                          {card.isDefault && (
                            <Badge variant="outline" className="text-xs">
                              Par défaut
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-600">
                          Expire {card.exp_month?.toString().padStart(2, '0') || '00'}/{card.exp_year || '0000'}
                        </p>
                      </div>
                    </div>
                    {selectedCardId === card.id && (
                      <Check className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="border-t pt-4">
            <Button
              variant="outline"
              onClick={onAddNewCard}
              className="w-full flex items-center gap-2"
              disabled={loading}
            >
              <Plus className="h-4 w-4" />
              Ajouter une nouvelle carte
            </Button>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={!selectedCardId || loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              {loading ? 'Configuration...' : 'Confirmer'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
