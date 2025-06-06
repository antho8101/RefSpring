
import { useParams } from 'react-router-dom';
import { useEffect, useState, useCallback, useRef } from 'react';
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
  
  // Protection contre les appels multiples
  const hasProcessedRef = useRef(false);
  const isProcessingRef = useRef(false);

  // PROTECTION ABSOLUE contre les appels multiples
  const handleShortLink = useCallback(async () => {
    // Si déjà traité ou en cours de traitement, ignorer
    if (hasProcessedRef.current || isProcessingRef.current) {
      console.log('🚫 PROTECTION - Traitement déjà effectué ou en cours, ignoré');
      return;
    }

    // Marquer comme en cours de traitement
    isProcessingRef.current = true;
    console.log('🚀 DÉBUT ShortLinkPage - Chargement...');

    if (!shortCode) {
      console.log('❌ Code de lien manquant');
      setError('Code de lien manquant');
      setLoading(false);
      isProcessingRef.current = false;
      return;
    }

    try {
      console.log('🔍 Récupération des données du lien court...');
      
      const shortLinkData = await getShortLinkData(shortCode);
      
      if (!shortLinkData) {
        console.log('❌ Aucune donnée trouvée pour le code');
        setError('Lien court non trouvé');
        setLoading(false);
        isProcessingRef.current = false;
        return;
      }

      console.log(`✅ Données du lien court trouvées`);

      // Récupérer les informations de la campagne
      console.log('🔍 Récupération des données de la campagne...');
      const campaignDoc = await getDoc(doc(db, 'campaigns', shortLinkData.campaignId));
      
      if (!campaignDoc.exists()) {
        console.log('❌ Campagne introuvable');
        setError('Campagne introuvable');
        setLoading(false);
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

      // APPEL UNIQUE et PROTÉGÉ de recordClick
      console.log('🔥 APPEL UNIQUE de recordClick - PROTECTION ACTIVÉE !');
      
      const clickId = await recordClick(shortLinkData.affiliateId, shortLinkData.campaignId, shortLinkData.targetUrl);
      console.log(`✅ recordClick terminé, retour: ${clickId}`);
      
      // Marquer comme traité APRÈS le recordClick
      hasProcessedRef.current = true;
      
      // Vérifier si la campagne est active
      if (!campaignData.isActive) {
        console.log('⏸️ Campagne en pause, pas de redirection');
        setLoading(false);
        isProcessingRef.current = false;
        return;
      }

      console.log(`🎯 URL de redirection: ${shortLinkData.targetUrl}`);
      
      // Redirection quasi immédiate
      console.log('🚀 REDIRECTION MAINTENANT !');
      setTimeout(() => {
        window.location.href = shortLinkData.targetUrl;
      }, 100);
      
    } catch (error) {
      console.log(`❌ Erreur: ${error}`);
      console.error('❌ Erreur lors du traitement du lien court:', error);
      setError('Erreur lors du traitement du lien');
      setLoading(false);
      isProcessingRef.current = false;
    }
  }, [shortCode, getShortLinkData, recordClick]);

  // Effet unique au montage
  useEffect(() => {
    handleShortLink();
  }, []); // Dépendances vides pour n'exécuter qu'une fois

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
