
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useShortLinks } from '@/hooks/useShortLinks';
import { useTracking } from '@/hooks/useTracking';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Campaign } from '@/types';

const ShortLinkPage = () => {
  const { shortCode } = useParams();
  const { getShortLinkData } = useShortLinks();
  const { recordClick } = useTracking();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    const handleShortLink = async () => {
      if (!shortCode) {
        console.log('❌ Code de lien manquant');
        setError('Code de lien manquant');
        setLoading(false);
        return;
      }

      try {
        console.log('🚀 Début traitement lien court:', shortCode);
        
        const shortLinkData = await getShortLinkData(shortCode);
        
        if (!shortLinkData) {
          console.log('❌ Aucune donnée trouvée pour le code:', shortCode);
          setError('Lien court non trouvé');
          setLoading(false);
          return;
        }

        console.log('✅ Données du lien court trouvées:', shortLinkData);

        // Récupérer les informations de la campagne
        const campaignDoc = await getDoc(doc(db, 'campaigns', shortLinkData.campaignId));
        
        if (!campaignDoc.exists()) {
          setError('Campagne introuvable');
          setLoading(false);
          return;
        }

        const campaignData = {
          id: campaignDoc.id,
          ...campaignDoc.data(),
          createdAt: campaignDoc.data().createdAt?.toDate(),
          updatedAt: campaignDoc.data().updatedAt?.toDate(),
        } as Campaign;

        setCampaign(campaignData);

        // Enregistrer le clic avec les 3 paramètres requis dans le bon ordre
        console.log('📊 Enregistrement du clic...');
        await recordClick(shortLinkData.affiliateId, shortLinkData.campaignId, shortLinkData.targetUrl);
        
        // Vérifier si la campagne est active
        if (!campaignData.isActive) {
          console.log('⏸️ Campagne en pause, pas de redirection');
          setLoading(false);
          return;
        }

        console.log('🎯 Redirection vers:', shortLinkData.targetUrl);
        
        // Rediriger vers l'URL de destination
        window.location.href = shortLinkData.targetUrl;
        
      } catch (error) {
        console.error('❌ Erreur lors du traitement du lien court:', error);
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
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-lg font-medium text-red-600 mb-2">Erreur</h2>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-400 mt-2">Code: {shortCode}</p>
        </div>
      </div>
    );
  }

  if (campaign && !campaign.isActive) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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

  return null;
};

export default ShortLinkPage;
