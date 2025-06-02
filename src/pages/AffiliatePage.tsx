
import { useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, TrendingUp, Calendar } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Affiliate } from '@/types';

const AffiliatePage = () => {
  const { campaignId } = useParams();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref'); // Récupère le code d'affilié s'il existe dans l'URL
  
  const [campaignName, setCampaignName] = useState('');
  const [selectedAffiliate, setSelectedAffiliate] = useState<string | null>(null);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Statistiques (à connecter à de vraies données plus tard)
  const [stats, setStats] = useState({
    clicks: 0,
    conversions: 0,
    commissions: 0,
  });

  // Récupérer les infos de la campagne et ses affiliés
  useEffect(() => {
    const fetchCampaignData = async () => {
      if (!campaignId) return;
      
      try {
        // Récupérer les infos de la campagne
        const campaignDoc = await getDocs(
          query(collection(db, 'campaigns'), where('id', '==', campaignId))
        );
        
        if (!campaignDoc.empty) {
          setCampaignName(campaignDoc.docs[0].data().name || 'Campagne');
        }
        
        // Récupérer tous les affiliés pour cette campagne
        const affiliatesQuery = query(
          collection(db, 'affiliates'), 
          where('campaignId', '==', campaignId)
        );
        
        const affiliatesSnapshot = await getDocs(affiliatesQuery);
        const affiliatesData = affiliatesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Affiliate[];
        
        setAffiliates(affiliatesData);
        
        // Si un code d'affilié est dans l'URL, le sélectionner
        if (refCode) {
          const affiliate = affiliatesData.find(a => a.trackingCode === refCode);
          if (affiliate) {
            setSelectedAffiliate(affiliate.id);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
        setLoading(false);
      }
    };
    
    fetchCampaignData();
  }, [campaignId, refCode]);

  // Charger les statistiques lorsqu'un affilié est sélectionné
  useEffect(() => {
    // Cette fonction sera implémentée plus tard pour charger les vraies stats
    const loadAffiliateStats = async () => {
      if (!selectedAffiliate) return;
      
      // Simulation de chargement - à remplacer par de vraies données
      setStats({
        clicks: Math.floor(Math.random() * 100),
        conversions: Math.floor(Math.random() * 20),
        commissions: Math.floor(Math.random() * 1000),
      });
    };
    
    loadAffiliateStats();
  }, [selectedAffiliate]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-blue-600">RefSpring</h1>
              <p className="text-sm text-gray-600">Dashboard Affiliés</p>
            </div>
            <Badge variant="outline">{campaignName || 'Chargement...'}</Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {campaignName || 'Campagne'} - Statistiques
          </h2>
          <p className="text-gray-600">
            Suivez les performances des affiliés en temps réel
          </p>
        </div>

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
        </div>

        {selectedAffiliate ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Clics Total</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.clicks}</div>
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
                  <div className="text-2xl font-bold">{stats.conversions}</div>
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
                  <div className="text-2xl font-bold">{stats.commissions}€</div>
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
                  Choisissez un affilié dans le menu déroulant pour voir ses statistiques
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default AffiliatePage;
