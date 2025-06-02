
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
import { useCampaigns } from '@/hooks/useCampaigns';
import { useAffiliates } from '@/hooks/useAffiliates';
import { Settings, Users, Eye, Copy, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

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
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    console.log('CampaignsList: showing empty state');
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Eye className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucune campagne</h3>
          <p className="text-muted-foreground text-center">
            Créez votre première campagne pour commencer à gérer vos affiliés.
          </p>
        </CardContent>
      </Card>
    );
  }

  console.log('CampaignsList: rendering campaigns list');
  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} onCopyUrl={copyTrackingUrl} />
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {campaign.name}
              <Badge variant={campaign.isActive ? "default" : "secondary"}>
                {campaign.isActive ? "Active" : "Inactive"}
              </Badge>
            </CardTitle>
            <CardDescription>{campaign.description}</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onCopyUrl(campaign.id)}
              title="Copier l'URL de tracking pour vos affiliés"
            >
              <Copy className="h-4 w-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive cursor-pointer">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Supprimer
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">URL:</span>
            <p className="font-mono text-xs truncate">{campaign.targetUrl}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Affiliés:</span>
            <p className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {affiliates.length}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Créée le:</span>
            <p>{new Date(campaign.createdAt).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
