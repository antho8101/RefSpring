import { useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
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
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const { recordClick } = useTracking();

  // Fonction pour ajouter des logs visibles
  const addDebugLog = useCallback((message: string) => {
    console.log(message);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  }, []);

  // CORRECTION CRITIQUE : useCallback pour mémoriser la fonction et éviter la boucle infinie
  const handleTracking = useCallback(async () => {
    addDebugLog('🚀 DÉBUT TrackingPage - Chargement...');
    addDebugLog(`📋 Paramètres: campaign=${campaignId}, affiliate=${affiliateId}`);

    if (!campaignId || !affiliateId) {
      addDebugLog('❌ Paramètres manquants');
      setError('Paramètres manquants');
      setIsTracking(false);
      return;
    }

    try {
      addDebugLog('🔍 Récupération des données de la campagne...');
      
      // Récupérer les informations de la campagne
      const campaignDoc = await getDoc(doc(db, 'campaigns', campaignId));
      
      if (!campaignDoc.exists()) {
        addDebugLog('❌ Campagne introuvable');
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
      addDebugLog(`✅ Campagne trouvée: ${campaignData.name}`);

      const targetUrl = searchParams.get('url') || campaignData.targetUrl || 'https://example.com';
      
      addDebugLog(`🎯 URL de destination: ${targetUrl}`);
      addDebugLog(`📊 Campagne active: ${campaignData.isActive}`);

      // APPEL UNIQUE de recordClick
      addDebugLog('🔥 APPEL UNIQUE de recordClick - ATTENTION AUX LOGS !');
      const clickId = await recordClick(affiliateId, campaignId, targetUrl);
      addDebugLog(`✅ recordClick terminé, retour: ${clickId}`);
      
      // Si la campagne est en pause, ne pas rediriger
      if (!campaignData.isActive) {
        addDebugLog('⏸️ Campagne en pause, pas de redirection');
        setIsTracking(false);
        return;
      }
      
      addDebugLog('⏳ Attente 2 secondes avant redirection...');
      setTimeout(() => {
        addDebugLog('🚀 REDIRECTION MAINTENANT !');
        window.location.href = targetUrl;
      }, 2000);
      
    } catch (error) {
      addDebugLog(`❌ Erreur: ${error}`);
      console.error('Error during tracking:', error);
      setError('Erreur lors du traitement');
      setIsTracking(false);
    }
  }, [campaignId, affiliateId, searchParams, recordClick, addDebugLog]);

  // CORRECTION CRITIQUE : Dépendances correctes pour éviter la boucle infinie
  useEffect(() => {
    handleTracking();
  }, [handleTracking]);

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
      <div className="text-center max-w-2xl">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 mb-6">
          {isTracking ? 'Enregistrement du clic...' : 'Redirection en cours...'}
        </p>
        
        {/* LOGS VISIBLES EN TEMPS RÉEL */}
        <div className="bg-black text-green-400 text-left p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
          <h3 className="text-white mb-2">🔍 Debug en temps réel:</h3>
          {debugInfo.map((log, index) => (
            <div key={index} className="mb-1">{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;
