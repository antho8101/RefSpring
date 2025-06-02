
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useAffiliates } from '@/hooks/useAffiliates';
import { Settings, Users, Eye, Copy, Trash2, TrendingUp, Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { CreateAffiliateDialog } from '@/components/CreateAffiliateDialog';
import { AffiliatesList } from '@/components/AffiliatesList';

export const CampaignsList = () => {
  const { campaigns, loading } = useCampaigns();
  const { toast } = useToast();

  console.log('CampaignsList render - campaigns:', campaigns, 'loading:', loading);

  const copyTrackingUrl = (campaignId: string) => {
    const trackingUrl = `https://refspring.com/r/${campaignId}`;
    navigator.clipboard.writeText(trackingUrl);
    toast({
      title: "URL de tracking copiée",
      description: "Partagez cette URL avec vos affiliés pour qu'ils puissent tracker leurs conversions",
    });
  };

  if (loading) {
    console.log('CampaignsList: showing loading state');
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse bg-gradient-to-br from-white to-slate-50/50 border-slate-200/50 shadow-lg">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    console.log('CampaignsList: showing empty state');
    return (
      <Card className="bg-gradient-to-br from-white to-slate-50/50 border-slate-200/50 shadow-xl backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="p-4 bg-blue-100 rounded-full mb-6">
            <Eye className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-3">Aucune campagne</h3>
          <p className="text-slate-600 text-center max-w-md leading-relaxed">
            Créez votre première campagne pour commencer à gérer vos affiliés et générer des revenus.
          </p>
          <div className="mt-6 flex items-center gap-2 text-sm text-slate-500">
            <TrendingUp className="h-4 w-4" />
            <span>Prêt à transformer votre business</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log('CampaignsList: rendering campaigns list');
  return (
    <div className="space-y-6">
      {campaigns.map((campaign, index) => (
        <div 
          key={campaign.id} 
          className="animate-fade-in" 
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <CampaignCard campaign={campaign} onCopyUrl={copyTrackingUrl} />
        </div>
      ))}
    </div>
  );
};

interface CampaignCardProps {
  campaign: any;
  onCopyUrl: (id: string) => void;
}

const CampaignCard = ({ campaign, onCopyUrl }: CampaignCardProps) => {
  const { affiliates } = useAffiliates(campaign.id);
  const { deleteCampaign } = useCampaigns();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAffiliatesOpen, setIsAffiliatesOpen] = useState(false);

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
    <Card className="bg-gradient-to-br from-white to-slate-50/50 border-slate-200/50 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] backdrop-blur-sm group">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="flex items-center gap-2">
                {campaign.name}
                <Badge 
                  variant={campaign.isActive ? "default" : "secondary"}
                  className={campaign.isActive 
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-0" 
                    : "bg-slate-200 text-slate-600"
                  }
                >
                  {campaign.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardTitle>
            <CardDescription className="text-slate-600 mt-2 leading-relaxed">
              {campaign.description}
            </CardDescription>
          </div>
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
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hover:scale-105 transition-all shadow-lg backdrop-blur-sm border-slate-300">
                  <Settings className="h-4 w-4" />
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
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-50/50 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">URL Cible</span>
            </div>
            <p className="font-mono text-xs text-slate-600 truncate bg-white/70 px-2 py-1 rounded">
              {campaign.targetUrl}
            </p>
          </div>
          
          <div className="bg-green-50/50 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Affiliés</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-900">{affiliates.length}</span>
              <span className="text-xs text-slate-500">actifs</span>
            </div>
          </div>
          
          <div className="bg-purple-50/50 p-4 rounded-xl">
            <div className="flex items-center gap-2 text-purple-600 mb-2">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">Créée le</span>
            </div>
            <p className="text-sm font-semibold text-slate-900">
              {new Date(campaign.createdAt).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>

        {/* Section des affiliés */}
        <Collapsible open={isAffiliatesOpen} onOpenChange={setIsAffiliatesOpen}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full flex items-center justify-between p-3 hover:bg-slate-100/50 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="font-medium">Affiliés de cette campagne ({affiliates.length})</span>
              </div>
              {isAffiliatesOpen ? 
                <ChevronDown className="h-4 w-4" /> : 
                <ChevronRight className="h-4 w-4" />
              }
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <AffiliatesList campaignId={campaign.id} />
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};
