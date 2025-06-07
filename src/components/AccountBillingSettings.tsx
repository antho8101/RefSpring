
import { CreditCard, Clock } from 'lucide-react';

interface AccountBillingSettingsProps {
  onCancel: () => void;
}

export const AccountBillingSettings = ({ onCancel }: AccountBillingSettingsProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <div className="mb-4">
          <CreditCard className="h-16 w-16 mx-auto text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">Gestion de la facturation</h3>
        <p className="text-slate-600 mb-4">
          La gestion des abonnements et de la facturation sera bientôt disponible
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
          <Clock className="h-4 w-4" />
          <span className="text-sm font-medium">Fonctionnalité en développement</span>
        </div>
      </div>
    </div>
  );
};
