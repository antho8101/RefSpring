
import { useParams, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

const TrackingPage = () => {
  const { campaignId, affiliateId } = useParams();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Log du tracking pour debug
    console.log('Tracking - Campaign:', campaignId, 'Affiliate:', affiliateId);
    console.log('Search params:', Object.fromEntries(searchParams));

    // Ici on ajoutera plus tard la logique de tracking réelle
    // Pour l'instant on redirige vers une page par défaut
    const targetUrl = searchParams.get('url') || 'https://example.com';
    
    // Redirection après tracking
    setTimeout(() => {
      window.location.href = targetUrl;
    }, 100);
  }, [campaignId, affiliateId, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirection en cours...</p>
      </div>
    </div>
  );
};

export default TrackingPage;
