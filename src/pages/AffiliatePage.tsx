
import { useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart3, Users, TrendingUp, Calendar, Copy, ExternalLink, Link } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Affiliate } from '@/types';
import { useAffiliateStats } from '@/hooks/useAffiliateStats';
import { useToast } from '@/hooks/use-toast';

const AffiliatePage = () => {
  const { campaignId } = useParams();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref');
  
  const [campaignName, setCampaignName] = useState('');
  const [selectedAffiliate, setSelectedAffiliate] = useState<string | null>(null);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [targetUrl, setTargetUrl] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  
  const { toast } = useToast();
  
  // Utiliser le hook pour les vraies statistiques
  const { stats, loading: statsLoading } = useAffiliateStats(selectedAffiliate);

  // Récupérer les infos de la campagne et ses affiliés
  useEffect(() => {
    const fetchCampaignData = async () => {
      if (!campaignId) {
        console.log('No campaignId provided');
        setError('ID de campagne manquant');
        setLoading(false);
        return;
      }
      
      try {
        console.log('Fetching campaign with ID:', campaignId);
        
        try {
          const campaignRef = doc(db, 'campaigns', campaignId);
          const campaignDoc = await getDoc(campaignRef);
          
          if (campaignDoc.exists()) {
            const campaignData = campaignDoc.data();
            console.log('Campaign data:', campaignData);
            setCampaignName(campaignData.name || 'Campagne');
            setTargetUrl(campaignData.targetUrl || '');
          } else {
            console.log('Campaign not found with ID:', campaignId);
            setCampaignName('Campagne publique');
          }
        } catch (campaignError) {
          console.log('Cannot access campaign due to permissions, using default name');
          setCampaignName('Campagne publique');
        }
        
        try {
          console.log('Fetching affiliates for campaign:', campaignId);
          const affiliatesQuery = query(
            collection(db, 'affiliates'), 
            where('campaignId', '==', campaignId)
          );
          
          const affiliatesSnapshot = await getDocs(affiliatesQuery);
          console.log('Affiliates snapshot size:', affiliatesSnapshot.size);
          
          const affiliatesData = affiliatesSnapshot.docs.map(doc => {
            const data = doc.data();
            console.log('Affiliate doc:', doc.id, data);
            return {
              id: doc.id,
              ...data
            };
          }) as Affiliate[];
          
          console.log('Processed affiliates data:', affiliatesData);
          setAffiliates(affiliatesData);
          
          if (refCode) {
            console.log('Looking for affiliate with tracking code:', refCode);
            const affiliate = affiliatesData.find(a => a.trackingCode === refCode);
            if (affiliate) {
              console.log('Found affiliate:', affiliate);
              setSelectedAffiliate(affiliate.id);
            } else {
              console.log('No affiliate found with tracking code:', refCode);
            }
          }
        } catch (affiliatesError) {
          console.log('Cannot access affiliates due to permissions:', affiliatesError);
          setError('Cette campagne nécessite une authentification pour afficher les données des affiliés');
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
        setError(`Cette campagne n'est pas accessible publiquement`);
        setCampaignName('Accès restreint');
        setLoading(false);
      }
    };
    
    fetchCampaignData();
  }, [campaignId, refCode]);

  // Générer le lien de tracking
  useEffect(() => {
    if (selectedAffiliate && targetUrl) {
      const currentHostname = window.location.hostname;
      let baseUrl;
      
      if (currentHostname.includes('localhost') || currentHostname.includes('lovableproject.com')) {
        baseUrl = window.location.origin;
      } else {
        baseUrl = 'https://refspring.com';
      }
      
      const link = `${baseUrl}/track/${campaignId}/${selectedAffiliate}?url=${encodeURIComponent(targetUrl)}`;
      setGeneratedLink(link);
    } else {
      setGeneratedLink('');
    }
  }, [selectedAffiliate, campaignId, targetUrl]);

  const copyLink = async () => {
    if (!generatedLink) return;
    
    try {
      await navigator.clipboard.writeText(generatedLink);
      toast({
        title: "Lien copié !",
        description: "Le lien de tracking a été copié dans le presse-papiers",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien",
        variant: "destructive",
      });
    }
  };

  const testLink = () => {
    if (generatedLink) {
      window.open(generatedLink, '_blank');
    }
  };

  // Error display with more helpful message for public access
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2 text-red-600">Accès restreint</h3>
              <p className="text-gray-600">{error}</p>
              <p className="text-sm text-gray-400 mt-4">
                Cette campagne nécessite peut-être une configuration spéciale pour l'accès public.
              </p>
              <p className="text-xs text-gray-400 mt-2">ID: {campaignId}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-blue-600">RefSpring</h1>
              <p className="text-sm text-gray-600">Dashboard Public</p>
            </div>
            <Badge variant="outline">
              {loading ? 'Chargement...' : (campaignName || 'Campagne')}
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {loading ? 'Chargement...' : (campaignName || 'Campagne')} - Dashboard Affilié
          </h2>
          <p className="text-gray-600">
            Générez vos liens de tracking et suivez vos performances
          </p>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement des données...</p>
          </div>
        ) : (
          <>
            {/* Sélecteur d'affilié */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <label htmlFor="affiliate-selector" className="text-sm font-medium">
                  Sélectionner un affilié:
                </label>
                <div className="w-64">
                  <Select 
                    value={selectedAffiliate || ''} 
                    onValueChange={setSelectedAffiliate}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un affilié" />
                    </SelectTrigger>
                    <SelectContent>
                      {affiliates.map((affiliate) => (
                        <SelectItem key={affiliate.id} value={affiliate.id}>
                          {affiliate.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                {affiliates.length} affilié(s) trouvé(s)
              </p>
            </div>

            {selectedAffiliate ? (
              <>
                {/* Générateur de liens de tracking */}
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Link className="h-5 w-5" />
                      Générateur de liens de tracking
                    </CardTitle>
                    <CardDescription>
                      Créez votre lien de tracking personnalisé avec l'URL de destination
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="target-url">URL de destination</Label>
                      <Input
                        id="target-url"
                        type="url"
                        placeholder="https://example.com/produit"
                        value={targetUrl}
                        onChange={(e) => setTargetUrl(e.target.value)}
                      />
                      <p className="text-xs text-gray-500">
                        L'URL vers laquelle vos visiteurs seront redirigés après le tracking
                      </p>
                    </div>
                    
                    {generatedLink && (
                      <div className="space-y-2">
                        <Label>Votre lien de tracking</Label>
                        <div className="flex gap-2">
                          <Input
                            value={generatedLink}
                            readOnly
                            className="font-mono text-xs"
                          />
                          <Button onClick={copyLink} size="sm">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button onClick={testLink} size="sm" variant="outline">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-green-600">
                          ✅ Lien prêt à être partagé ! Cliquez sur "Copier" puis partagez-le.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Clics Total</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {statsLoading ? '...' : stats.clicks}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Visiteurs uniques tracés
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {statsLoading ? '...' : stats.conversions}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Taux de conversion: {stats.clicks ? ((stats.conversions / stats.clicks) * 100).toFixed(1) : 0}%
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Commissions</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {statsLoading ? '...' : `${stats.commissions}€`}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        En attente de validation
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Placeholder pour futurs graphiques */}
                <Card>
                  <CardHeader>
                    <CardTitle>Évolution des performances</CardTitle>
                    <CardDescription>
                      Graphiques et données détaillées
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Les graphiques détaillés seront disponibles prochainement</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-10">
                  <div className="text-center">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">Sélectionnez un affilié</h3>
                    <p className="text-gray-500">
                      {affiliates.length > 0 
                        ? "Choisissez un affilié dans le menu déroulant pour voir ses statistiques et générer ses liens de tracking"
                        : "Aucun affilié trouvé pour cette campagne"
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AffiliatePage;
