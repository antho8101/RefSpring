
import { useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTracking } from '@/hooks/useTracking';

const TrackingPage = () => {
  const { campaignId, affiliateId } = useParams();
  const [searchParams] = useSearchParams();
  const [isTracking, setIsTracking] = useState(true);
  const { recordClick } = useTracking();

  useEffect(() => {
    const handleTracking = async () => {
      if (!campaignId || !affiliateId) {
        console.error('Missing campaignId or affiliateId');
        setIsTracking(false);
        return;
      }

      const targetUrl = searchParams.get('url') || 'https://example.com';
      
      console.log('Tracking - Campaign:', campaignId, 'Affiliate:', affiliateId);
      console.log('Target URL:', targetUrl);
      console.log('Search params:', Object.fromEntries(searchParams));

      // Enregistrer le clic
      await recordClick(affiliateId, campaignId, targetUrl);
      
      // Redirection après tracking
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 500); // Petit délai pour s'assurer que l'enregistrement se termine
    };

    handleTracking();
  }, [campaignId, affiliateId, searchParams, recordClick]);

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
