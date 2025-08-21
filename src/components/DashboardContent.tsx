
import { CreateCampaignDialog } from '@/components/CreateCampaignDialog';
import { CampaignsList } from '@/components/CampaignsList';
import { CampaignSuccessModal } from '@/components/CampaignSuccessModal';
import { ConfettiCelebration } from '@/components/ConfettiCelebration';
import { PluginManager } from '@/components/plugins/PluginManager';
import { useSuccessModalState } from '@/hooks/useSuccessModalState';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Puzzle } from 'lucide-react';

export const DashboardContent = () => {
  const { user } = useAuth();
  
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
        <Tabs defaultValue="campaigns" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-6">
            <TabsTrigger value="campaigns" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Mes Campagnes
            </TabsTrigger>
            <TabsTrigger value="plugins" className="flex items-center gap-2">
              <Puzzle className="h-4 w-4" />
              Plugins
            </TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 min-w-0">
              <div className="min-w-0 flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 truncate">Mes Campagnes</h2>
                <p className="text-slate-600 text-sm sm:text-base truncate">Gérez vos campagnes d'affiliation en temps réel</p>
              </div>
              <div className="flex-shrink-0 w-full sm:w-auto" data-tour="create-campaign">
                <CreateCampaignDialog onSuccessModalTrigger={showSuccessModal} />
              </div>
            </div>
            
            <div className="relative min-w-0" data-tour="campaigns-list">
              <CampaignsList onSuccessModalTrigger={showSuccessModal} />
            </div>
          </TabsContent>

          <TabsContent value="plugins">
            {user?.uid && (
              <PluginManager 
                campaignId="" 
                userId={user.uid}
              />
            )}
          </TabsContent>
        </Tabs>
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
