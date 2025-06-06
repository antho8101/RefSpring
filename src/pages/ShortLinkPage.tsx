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
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  
  // Protection contre les appels multiples
  const hasProcessedRef = useRef(false);
  const isProcessingRef = useRef(false);

  // Fonction pour ajouter des logs visibles
  const addDebugLog = useCallback((message: string) => {
    console.log(message);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  }, []);

  // PROTECTION ABSOLUE contre les appels multiples
  const handleShortLink = useCallback(async () => {
    // Si déjà traité ou en cours de traitement, ignorer
    if (hasProcessedRef.current || isProcessingRef.current) {
      addDebugLog('🚫 PROTECTION - Traitement déjà effectué ou en cours, ignoré');
      return;
    }

    // Marquer comme en cours de traitement
    isProcessingRef.current = true;
    addDebugLog('🚀 DÉBUT ShortLinkPage - Chargement...');
    addDebugLog(`📋 Code court: ${shortCode}`);

    if (!shortCode) {
      addDebugLog('❌ Code de lien manquant');
      setError('Code de lien manquant');
      setLoading(false);
      isProcessingRef.current = false;
      return;
    }

    try {
      addDebugLog('🔍 Récupération des données du lien court...');
      
      const shortLinkData = await getShortLinkData(shortCode);
      
      if (!shortLinkData) {
        addDebugLog('❌ Aucune donnée trouvée pour le code');
        setError('Lien court non trouvé');
        setLoading(false);
        isProcessingRef.current = false;
        return;
      }

      addDebugLog(`✅ Données du lien court trouvées: ${JSON.stringify(shortLinkData)}`);

      // Récupérer les informations de la campagne
      addDebugLog('🔍 Récupération des données de la campagne...');
      const campaignDoc = await getDoc(doc(db, 'campaigns', shortLinkData.campaignId));
      
      if (!campaignDoc.exists()) {
        addDebugLog('❌ Campagne introuvable');
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
      addDebugLog(`✅ Campagne trouvée: ${campaignData.name}`);

      // APPEL UNIQUE et PROTÉGÉ de recordClick
      addDebugLog('🔥 APPEL UNIQUE de recordClick - PROTECTION ACTIVÉE !');
      addDebugLog(`📊 Paramètres: affiliate=${shortLinkData.affiliateId}, campaign=${shortLinkData.campaignId}, url=${shortLinkData.targetUrl}`);
      
      const clickId = await recordClick(shortLinkData.affiliateId, shortLinkData.campaignId, shortLinkData.targetUrl);
      addDebugLog(`✅ recordClick terminé, retour: ${clickId}`);
      
      // Marquer comme traité APRÈS le recordClick
      hasProcessedRef.current = true;
      
      // Vérifier si la campagne est active
      if (!campaignData.isActive) {
        addDebugLog('⏸️ Campagne en pause, pas de redirection');
        setLoading(false);
        isProcessingRef.current = false;
        return;
      }

      addDebugLog(`🎯 URL de redirection: ${shortLinkData.targetUrl}`);
      addDebugLog('⏳ Attente 2 secondes avant redirection...');
      
      // Rediriger vers l'URL de destination
      setTimeout(() => {
        addDebugLog('🚀 REDIRECTION MAINTENANT !');
        window.location.href = shortLinkData.targetUrl;
      }, 2000);
      
    } catch (error) {
      addDebugLog(`❌ Erreur: ${error}`);
      console.error('❌ Erreur lors du traitement du lien court:', error);
      setError('Erreur lors du traitement du lien');
      setLoading(false);
      isProcessingRef.current = false;
    }
  }, [shortCode, getShortLinkData, recordClick, addDebugLog]);

  // Effet unique au montage
  useEffect(() => {
    handleShortLink();
  }, []); // Dépendances vides pour n'exécuter qu'une fois

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">Enregistrement du clic...</h2>
          <p className="text-gray-600 mb-6">Redirection en cours...</p>
          
          {/* LOGS VISIBLES EN TEMPS RÉEL */}
          <div className="bg-black text-green-400 text-left p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
            <h3 className="text-white mb-2">🔍 Debug ShortLink en temps réel:</h3>
            {debugInfo.map((log, index) => (
              <div key={index} className="mb-1">{log}</div>
            ))}
          </div>
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
          
          {/* Afficher les logs même en cas d'erreur */}
          {debugInfo.length > 0 && (
            <div className="bg-black text-green-400 text-left p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto mt-4">
              <h3 className="text-white mb-2">🔍 Logs d'erreur:</h3>
              {debugInfo.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))}
            </div>
          )}
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
          
          {/* Afficher les logs même en pause */}
          {debugInfo.length > 0 && (
            <div className="bg-black text-green-400 text-left p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto mt-4">
              <h3 className="text-white mb-2">🔍 Logs debug:</h3>
              {debugInfo.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default ShortLinkPage;
