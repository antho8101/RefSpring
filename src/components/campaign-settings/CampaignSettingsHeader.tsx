
interface CampaignSettingsHeaderProps {
  activeTab: string;
}

export const CampaignSettingsHeader = ({ activeTab }: CampaignSettingsHeaderProps) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'general':
        return 'Paramètres généraux';
      case 'integration':
        return 'Intégration';
      case 'payment':
        return 'Méthode de paiement';
      case 'affiliates':
        return 'Gestion des affiliés';
      default:
        return 'Paramètres';
    }
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case 'general':
        return 'Configurez les informations de base de votre campagne';
      case 'integration':
        return 'Configurez le tracking d\'affiliation sur votre site';
      case 'payment':
        return 'Gérez votre méthode de paiement pour les commissions';
      case 'affiliates':
        return 'Gérez tous les affiliés de cette campagne';
      default:
        return '';
    }
  };

  return (
    <div className="p-8 border-b bg-white">
      <h3 className="text-2xl font-semibold text-slate-900">{getTabTitle()}</h3>
      <p className="text-slate-600 mt-2">{getTabDescription()}</p>
    </div>
  );
};
