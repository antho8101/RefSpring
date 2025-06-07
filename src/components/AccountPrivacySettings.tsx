
import { Shield, Eye } from 'lucide-react';

interface AccountPrivacySettingsProps {
  onCancel: () => void;
}

export const AccountPrivacySettings = ({ onCancel }: AccountPrivacySettingsProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <div className="mb-4">
          <Shield className="h-16 w-16 mx-auto text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-900 mb-2">Paramètres de confidentialité</h3>
        <p className="text-slate-600 mb-4">
          Gérez vos préférences de confidentialité et de données
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg">
          <Eye className="h-4 w-4" />
          <span className="text-sm font-medium">Vos données sont protégées</span>
        </div>
      </div>
    </div>
  );
};
