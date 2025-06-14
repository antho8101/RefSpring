
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Trash2, AlertTriangle } from 'lucide-react';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const CampaignDeletionUtility = () => {
  const [loading, setLoading] = useState(false);
  const [draftCampaigns, setDraftCampaigns] = useState<any[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadDraftCampaigns = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      console.log('🔍 Recherche des campagnes brouillon pour:', user.uid);
      
      const campaignsQuery = query(
        collection(db, 'campaigns'),
        where('userId', '==', user.uid),
        where('isDraft', '==', true)
      );
      
      const campaignsSnapshot = await getDocs(campaignsQuery);
      const drafts = campaignsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      }));
      
      console.log('📋 Campagnes brouillon trouvées:', drafts.length);
      setDraftCampaigns(drafts);
      
      toast({
        title: "Campagnes trouvées",
        description: `${drafts.length} campagnes en brouillon trouvées`,
      });
    } catch (error) {
      console.error('❌ Erreur chargement brouillons:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les campagnes brouillon",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteDraftCampaign = async (campaignId: string, campaignName: string) => {
    try {
      console.log('🗑️ Suppression de la campagne brouillon:', campaignId);
      
      const campaignRef = doc(db, 'campaigns', campaignId);
      await deleteDoc(campaignRef);
      
      // Mettre à jour la liste
      setDraftCampaigns(prev => prev.filter(c => c.id !== campaignId));
      
      toast({
        title: "Campagne supprimée",
        description: `"${campaignName}" a été supprimée avec succès`,
      });
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer cette campagne",
        variant: "destructive",
      });
    }
  };

  const deleteAllDrafts = async () => {
    if (!user?.uid || draftCampaigns.length === 0) return;
    
    setLoading(true);
    try {
      console.log('🗑️ Suppression de toutes les campagnes brouillon...');
      
      const deletePromises = draftCampaigns.map(campaign => 
        deleteDoc(doc(db, 'campaigns', campaign.id))
      );
      
      await Promise.all(deletePromises);
      
      toast({
        title: "Nettoyage terminé",
        description: `${draftCampaigns.length} campagnes brouillon supprimées`,
      });
      
      setDraftCampaigns([]);
    } catch (error) {
      console.error('❌ Erreur suppression globale:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression globale",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trash2 className="h-5 w-5" />
          Nettoyage des campagnes brouillon
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={loadDraftCampaigns} disabled={loading}>
            Charger les brouillons
          </Button>
          {draftCampaigns.length > 0 && (
            <Button 
              variant="destructive" 
              onClick={deleteAllDrafts}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Supprimer tous les brouillons ({draftCampaigns.length})
            </Button>
          )}
        </div>

        {draftCampaigns.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Campagnes brouillon :</h3>
            {draftCampaigns.map(campaign => (
              <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <span className="font-medium">{campaign.name}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    ({campaign.createdAt.toLocaleDateString()})
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteDraftCampaign(campaign.id, campaign.name)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
