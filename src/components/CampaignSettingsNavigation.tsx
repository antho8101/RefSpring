
import { FileText, CreditCard, Users, Code, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

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
    <div className="w-80 bg-slate-50 border-r p-6 flex flex-col">
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

      <div className="mt-6">
        <Separator className="mb-4" />
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-red-600 uppercase tracking-wide">Danger Zone</p>
          </div>
          <Button
            variant="destructive"
            onClick={onDeleteClick}
            className="w-full justify-start rounded-xl"
            size="sm"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer la campagne
          </Button>
        </div>
      </div>
    </div>
  );
};
