
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useCampaigns } from '@/hooks/useCampaigns';
import { Copy, Trash2, MoreHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { CreateAffiliateDialog } from '@/components/CreateAffiliateDialog';
import { CampaignSettingsDialog } from '@/components/CampaignSettingsDialog';
import { Campaign } from '@/types';

interface CampaignActionsProps {
  campaign: Campaign;
  onCopyUrl: (id: string) => void;
}

export const CampaignActions = ({ campaign, onCopyUrl }: CampaignActionsProps) => {
  const { deleteCampaign } = useCampaigns();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCampaign(campaign.id);
      toast({
        title: "Campagne supprimée",
        description: "La campagne a été supprimée avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la campagne",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <CreateAffiliateDialog campaignId={campaign.id} campaignName={campaign.name} />
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onCopyUrl(campaign.id)}
        title="Copier l'URL de tracking pour vos affiliés"
        className="hover:scale-105 transition-all shadow-lg backdrop-blur-sm border-slate-300"
      >
        <Copy className="h-4 w-4" />
      </Button>
      
      <CampaignSettingsDialog campaign={campaign} />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="hover:scale-105 transition-all shadow-lg backdrop-blur-sm border-slate-300">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white/95 backdrop-blur-xl border-slate-200 shadow-xl">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive cursor-pointer hover:bg-red-50">
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white/95 backdrop-blur-xl border-slate-200">
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer la campagne</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir supprimer la campagne "{campaign.name}" ? 
                  Cette action est irréversible et supprimera tous les affiliés et données associés.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? "Suppression..." : "Supprimer"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
