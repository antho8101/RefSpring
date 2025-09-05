import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Trash2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const CampaignDeletionUtility = () => {
  const [loading, setLoading] = useState(false);
  const [draftCampaigns, setDraftCampaigns] = useState<any[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const loadDraftCampaigns = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      console.log('🔍 SUPABASE: Recherche des campagnes brouillon pour:', user.uid);
      
      const { data: drafts, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user.uid)
        .eq('is_draft', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ SUPABASE: Erreur chargement brouillons:', error);
        throw error;
      }
      
      console.log('📋 SUPABASE: Campagnes brouillon trouvées:', drafts?.length || 0);
      setDraftCampaigns(drafts || []);
      
      toast({
        title: "Campagnes trouvées",
        description: `${drafts?.length || 0} campagnes en brouillon trouvées`,
      });
    } catch (error) {
      console.error('❌ SUPABASE: Erreur chargement brouillons:', error);
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
      console.log('🗑️ SUPABASE: Suppression de la campagne brouillon:', campaignId);
      
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId)
        .eq('user_id', user?.uid); // Sécurité supplémentaire
      
      if (error) {
        console.error('❌ SUPABASE: Erreur suppression:', error);
        throw error;
      }
      
      // Mettre à jour la liste
      setDraftCampaigns(prev => prev.filter(c => c.id !== campaignId));
      
      toast({
        title: "Campagne supprimée",
        description: `"${campaignName}" a été supprimée avec succès`,
      });
    } catch (error) {
      console.error('❌ SUPABASE: Erreur suppression:', error);
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
      console.log('🗑️ SUPABASE: Suppression de toutes les campagnes brouillon...');
      
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('user_id', user.uid)
        .eq('is_draft', true);
      
      if (error) {
        console.error('❌ SUPABASE: Erreur suppression globale:', error);
        throw error;
      }
      
      toast({
        title: "Nettoyage terminé",
        description: `${draftCampaigns.length} campagnes brouillon supprimées`,
      });
      
      setDraftCampaigns([]);
    } catch (error) {
      console.error('❌ SUPABASE: Erreur suppression globale:', error);
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
                    ({new Date(campaign.created_at).toLocaleDateString()})
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