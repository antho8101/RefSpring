
import { useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTracking } from '@/hooks/useTracking';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Campaign } from '@/types';

const TrackingPage = () => {
  const { campaignId, affiliateId } = useParams();
  const [searchParams] = useSearchParams();
  const [isTracking, setIsTracking] = useState(true);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { recordClick } = useTracking();

  useEffect(() => {
    const handleTracking = async () => {
      if (!campaignId || !affiliateId) {
        console.error('Missing campaignId or affiliateId');
        setError('Paramètres manquants');
        setIsTracking(false);
        return;
      }

      try {
        // Récupérer les informations de la campagne
        const campaignDoc = await getDoc(doc(db, 'campaigns', campaignId));
        
        if (!campaignDoc.exists()) {
          setError('Campagne introuvable');
          setIsTracking(false);
          return;
        }

        const campaignData = {
          id: campaignDoc.id,
          ...campaignDoc.data(),
          createdAt: campaignDoc.data().createdAt?.toDate(),
          updatedAt: campaignDoc.data().updatedAt?.toDate(),
        } as Campaign;

        setCampaign(campaignData);

        const targetUrl = searchParams.get('url') || campaignData.targetUrl || 'https://example.com';
        
        console.log('Tracking - Campaign:', campaignId, 'Affiliate:', affiliateId);
        console.log('Campaign active:', campaignData.isActive);
        console.log('Target URL:', targetUrl);

        // Enregistrer le clic même si la campagne est en pause (pour les stats)
        await recordClick(affiliateId, campaignId, targetUrl);
        
        // Si la campagne est en pause, ne pas rediriger
        if (!campaignData.isActive) {
          setIsTracking(false);
          return;
        }
        
        // Redirection après tracking pour les campagnes actives
        setTimeout(() => {
          window.location.href = targetUrl;
        }, 500);
        
      } catch (error) {
        console.error('Error during tracking:', error);
        setError('Erreur lors du traitement');
        setIsTracking(false);
      }
    };

    handleTracking();
  }, [campaignId, affiliateId, searchParams, recordClick]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!isTracking && campaign && !campaign.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="text-orange-500 text-4xl mb-4">⏸️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Campagne en pause</h2>
          <p className="text-gray-600 mb-4">
            La campagne "{campaign.name}" est actuellement en pause.
          </p>
          <p className="text-sm text-gray-500">
            Votre clic a été enregistré. Veuillez réessayer plus tard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">
          {isTracking ? 'Enregistrement du clic...' : 'Redirection en cours...'}
        </p>
      </div>
    </div>
  );
};

export default TrackingPage;
