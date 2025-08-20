import { useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Affiliate } from '@/types';
import { useAffiliateStats } from '@/hooks/useAffiliateStats';
import { AffiliateSelector } from '@/components/AffiliateSelector';
import { TrackingLinkGenerator } from '@/components/TrackingLinkGenerator';
import { AffiliateStatsDisplay } from '@/components/AffiliateStatsDisplay';
import { PublicDashboardHeader } from '@/components/PublicDashboardHeader';
import { PublicDashboardWelcome } from '@/components/PublicDashboardWelcome';
import { PublicDashboardEmptyState } from '@/components/PublicDashboardEmptyState';
import { PublicDashboardFooter } from '@/components/PublicDashboardFooter';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

const AffiliatePage = () => {
  const { campaignId } = useParams();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref');
  
  const { t } = useTranslation();
  
  const [campaignName, setCampaignName] = useState('');
  const [selectedAffiliate, setSelectedAffiliate] = useState<string | null>(null);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [targetUrl, setTargetUrl] = useState('');
  
  const { stats, loading: statsLoading } = useAffiliateStats(selectedAffiliate);

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
      <div className="min-h-screen bg-white overflow-hidden flex flex-col">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-20 right-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 left-10 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-green-500/5 rounded-full blur-2xl animate-pulse"></div>
        </div>
        
        <div className="relative z-10">
          <PublicDashboardHeader campaignName={t('publicDashboard.errors.accessRestricted')} loading={false} />
          <div className="flex-1 flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
            <Card className="max-w-md border-red-200 bg-red-50/50">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 text-red-500" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3 text-red-700">{t('publicDashboard.errors.accessRestricted')}</h3>
                  <p className="text-red-600 mb-4">{error}</p>
                  <p className="text-sm text-red-500/80 mb-4">
                    {t('publicDashboard.errors.specialConfig')}
                  </p>
                  <p className="text-xs text-red-400 font-mono bg-red-100/50 px-3 py-2 rounded-xl">
                    ID: {campaignId}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          <PublicDashboardFooter />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white overflow-hidden flex flex-col">
      {/* Background decorations */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-10 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-green-500/5 rounded-full blur-2xl animate-pulse"></div>
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        <PublicDashboardHeader campaignName={campaignName} loading={loading} />

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <PublicDashboardWelcome campaignName={campaignName} loading={loading} />

          {loading ? (
            <div className="text-center py-20">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600 font-medium">{t('publicDashboard.errors.loading')}</p>
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
                <PublicDashboardEmptyState hasAffiliates={affiliates.length > 0} />
              )}
            </>
          )}
        </main>

        <PublicDashboardFooter />
      </div>
    </div>
  );
};

export default AffiliatePage;
