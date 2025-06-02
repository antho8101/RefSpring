
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useShortLinks } from '@/hooks/useShortLinks';
import { useTracking } from '@/hooks/useTracking';

const ShortLinkPage = () => {
  const { shortCode } = useParams();
  const { getShortLinkData } = useShortLinks();
  const { recordClick } = useTracking();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleShortLink = async () => {
      if (!shortCode) {
        setError('Code de lien manquant');
        setLoading(false);
        return;
      }

      try {
        console.log('Récupération des données pour le code court:', shortCode);
        
        const shortLinkData = await getShortLinkData(shortCode);
        
        if (!shortLinkData) {
          setError('Lien court non trouvé');
          setLoading(false);
          return;
        }

        console.log('Données du lien court trouvées:', shortLinkData);

        // Enregistrer le clic
        await recordClick(shortLinkData.campaignId, shortLinkData.affiliateId);
        
        console.log('Redirection vers:', shortLinkData.targetUrl);
        
        // Rediriger vers l'URL de destination
        window.location.href = shortLinkData.targetUrl;
        
      } catch (error) {
        console.error('Erreur lors du traitement du lien court:', error);
        setError('Erreur lors du traitement du lien');
        setLoading(false);
      }
    };

    handleShortLink();
  }, [shortCode, getShortLinkData, recordClick]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">Enregistrement du clic...</h2>
          <p className="text-gray-600">Redirection en cours...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-medium text-red-600 mb-2">Erreur</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return null;
};

export default ShortLinkPage;
