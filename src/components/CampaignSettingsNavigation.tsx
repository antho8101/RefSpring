
import { FileText, CreditCard, Users, Code, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface CampaignSettingsNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onDeleteClick?: () => void;
}

export const CampaignSettingsNavigation = ({ activeTab, onTabChange, onDeleteClick }: CampaignSettingsNavigationProps) => {
  const navigationItems = [
    { id: 'general', label: 'Général', icon: FileText },
    { id: 'integration', label: 'Intégration', icon: Code },
    { id: 'payment', label: 'Méthode de paiement', icon: CreditCard },
    { id: 'affiliates', label: 'Gestion des affiliés', icon: Users },
  ];

  return (
    <div className="h-full bg-slate-50 border-r p-6 flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Paramètres</h2>
        <p className="text-sm text-slate-600">Configuration de la campagne</p>
      </div>
      
      <nav className="space-y-3 flex-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-colors text-left ${
                activeTab === item.id 
                  ? 'bg-white text-slate-900 shadow-sm font-medium' 
                  : 'text-slate-600 hover:bg-white/50'
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="text-left leading-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="flex-shrink-0">
        <Separator className="mb-4" />
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-red-600 uppercase tracking-wide">Danger Zone</p>
          </div>
          <button
            onClick={onDeleteClick}
            disabled={!onDeleteClick}
            className={`w-full flex items-center justify-start gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl transition-colors text-sm font-medium border border-red-200 ${
              !onDeleteClick ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'
            }`}
          >
            <Trash2 className="h-4 w-4" />
            Supprimer la campagne
          </button>
        </div>
      </div>
    </div>
  );
};
