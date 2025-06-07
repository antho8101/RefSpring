import { FileText, CreditCard, Users } from 'lucide-react';

interface CampaignSettingsNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const CampaignSettingsNavigation = ({ activeTab, onTabChange }: CampaignSettingsNavigationProps) => {
  const navigationItems = [
    { id: 'general', label: 'Général', icon: FileText },
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
    </div>
  );
};
