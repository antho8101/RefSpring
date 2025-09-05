
import { CreateCampaignDialogSimple } from '@/components/CreateCampaignDialogSimple';
import { CampaignsList } from '@/components/CampaignsList';
import { CampaignSuccessModal } from '@/components/CampaignSuccessModal';
import { ConfettiCelebration } from '@/components/ConfettiCelebration';
import { useSuccessModalState } from '@/hooks/useSuccessModalState';
import { Button } from '@/components/ui/button';

export const DashboardContent = () => {
  // 🔥 DÉPLACER LA GESTION DE LA MODALE AU NIVEAU PARENT
  const {
    successModalData,
    showConfetti,
    isSuccessModalOpen,
    showSuccessModal,
    hideSuccessModal,
  } = useSuccessModalState();

  console.log('🏠 DASHBOARD: États modale de succès:', {
    isSuccessModalOpen,
    successModalData,
    showConfetti
  });

  const handleSuccessModalClose = () => {
    console.log('🏠 DASHBOARD: Fermeture modale de succès');
    hideSuccessModal();
  };

  return (
    <>
      {/* CONFETTIS AU NIVEAU DASHBOARD */}
      <ConfettiCelebration 
        trigger={showConfetti} 
        onComplete={() => {}} 
      />
      
      <div className="space-y-4 sm:space-y-6 animate-fade-in min-w-0 overflow-visible" style={{ animationDelay: '0.2s' }}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 min-w-0">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 truncate">Mes Campagnes</h2>
            <p className="text-slate-600 text-sm sm:text-base truncate">Gérez vos campagnes d'affiliation en temps réel</p>
          </div>
          <div className="flex-shrink-0 w-full sm:w-auto" data-tour="create-campaign">
            <CreateCampaignDialogSimple>
              <Button 
                size="lg" 
                className="text-base lg:text-lg px-6 py-3 lg:px-8 lg:py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-[1.02] border-0 text-white group relative overflow-hidden w-full sm:w-auto" 
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'drop-shadow(0 0 15px rgba(59, 130, 246, 0.3))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'none';
                }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="relative z-10">Nouvelle Campagne</span>
              </Button>
            </CreateCampaignDialogSimple>
          </div>
        </div>
        
        <div className="relative min-w-0" data-tour="campaigns-list">
          <CampaignsList onSuccessModalTrigger={showSuccessModal} />
        </div>
      </div>

      {/* MODALE DE SUCCÈS AU NIVEAU DASHBOARD */}
      <CampaignSuccessModal
        open={isSuccessModalOpen}
        onOpenChange={handleSuccessModalClose}
        campaignId={successModalData?.campaignId || ''}
        campaignName={successModalData?.campaignName || ''}
      />
    </>
  );
};
