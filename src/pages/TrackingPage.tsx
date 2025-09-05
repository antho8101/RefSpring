
import { useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState, useCallback, useRef } from 'react';
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
  const { trackClick } = useTracking();

  // Protection contre les appels multiples
  const hasProcessedRef = useRef(false);
  const isProcessingRef = useRef(false);

  // PROTECTION ABSOLUE contre les appels multiples
  const handleTracking = useCallback(async () => {
    // Si déjà traité ou en cours de traitement, ignorer
    if (hasProcessedRef.current || isProcessingRef.current) {
      console.log('🚫 PROTECTION - Traitement déjà effectué ou en cours, ignoré');
      return;
    }

    // Marquer comme en cours de traitement
    isProcessingRef.current = true;
    console.log('🚀 DÉBUT TrackingPage - Chargement...');

    if (!campaignId || !affiliateId) {
      console.log('❌ Paramètres manquants');
      setError('Paramètres manquants');
      setIsTracking(false);
      isProcessingRef.current = false;
      return;
    }

    try {
      console.log('🔍 Récupération des données de la campagne...');
      
      // Récupérer les informations de la campagne
      const campaignDoc = await getDoc(doc(db, 'campaigns', campaignId));
      
      if (!campaignDoc.exists()) {
        console.log('❌ Campagne introuvable');
        setError('Campagne introuvable');
        setIsTracking(false);
        isProcessingRef.current = false;
        return;
      }

      const campaignData = {
        id: campaignDoc.id,
        ...campaignDoc.data(),
        createdAt: campaignDoc.data().createdAt?.toDate(),
        updatedAt: campaignDoc.data().updatedAt?.toDate(),
      } as Campaign;

      setCampaign(campaignData);
      console.log(`✅ Campagne trouvée: ${campaignData.name}`);

      const targetUrl = searchParams.get('url') || campaignData.targetUrl || 'https://example.com';
      
      console.log(`🎯 URL de destination: ${targetUrl}`);

      // APPEL UNIQUE et PROTÉGÉ de trackClick
      console.log('🔥 APPEL UNIQUE de trackClick - PROTECTION ACTIVÉE !');
      await trackClick({ affiliateId, campaignId });
      console.log('✅ trackClick terminé');
      
      // Marquer comme traité APRÈS le recordClick
      hasProcessedRef.current = true;
      
      // Si la campagne est en pause, ne pas rediriger
      if (!campaignData.isActive) {
        console.log('⏸️ Campagne en pause, pas de redirection');
        setIsTracking(false);
        isProcessingRef.current = false;
        return;
      }
      
      // Redirection quasi immédiate
      console.log('🚀 REDIRECTION MAINTENANT !');
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 100);
      
    } catch (error) {
      console.log(`❌ Erreur: ${error}`);
      console.error('Error during tracking:', error);
      setError('Erreur lors du traitement');
      setIsTracking(false);
      isProcessingRef.current = false;
    }
  }, [campaignId, affiliateId, searchParams, trackClick]);

  // Effet unique au montage
  useEffect(() => {
    handleTracking();
  }, []); // Dépendances vides pour n'exécuter qu'une fois

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
          Redirection en cours...
        </p>
      </div>
    </div>
  );
};

export default TrackingPage;
