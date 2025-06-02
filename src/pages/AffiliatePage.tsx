import { useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Affiliate } from '@/types';
import { useAffiliateStats } from '@/hooks/useAffiliateStats';
import { AffiliateSelector } from '@/components/AffiliateSelector';
import { TrackingLinkGenerator } from '@/components/TrackingLinkGenerator';
import { AffiliateStatsDisplay } from '@/components/AffiliateStatsDisplay';

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
            <AffiliateSelector
              affiliates={affiliates}
              selectedAffiliate={selectedAffiliate}
              onAffiliateChange={setSelectedAffiliate}
              loading={loading}
            />

            {selectedAffiliate && campaignId ? (
              <>
                <TrackingLinkGenerator
                  campaignId={campaignId}
                  affiliateId={selectedAffiliate}
                  targetUrl={targetUrl}
                />

                <AffiliateStatsDisplay
                  stats={stats}
                  loading={statsLoading}
                />
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
