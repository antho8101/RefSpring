import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface SupabaseMetrics {
  totalCampaigns: number;
  totalAffiliates: number;
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  avgResponseTime: number;
  errorRate: number;
  activeUsers: number;
  storageUsage: number;
  dbConnections: number;
  recentErrors: Array<{
    message: string;
    timestamp: Date;
    severity: string;
  }>;
}

export const useSupabaseMonitoring = () => {
  const [metrics, setMetrics] = useState<SupabaseMetrics>({
    totalCampaigns: 0,
    totalAffiliates: 0,
    totalClicks: 0,
    totalConversions: 0,
    totalRevenue: 0,
    avgResponseTime: 0,
    errorRate: 0,
    activeUsers: 0,
    storageUsage: 0,
    dbConnections: 0,
    recentErrors: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.uid) {
      setIsLoading(false);
      return;
    }

    collectMetrics();
    
    // Rafraîchir les métriques toutes les 30 secondes
    const interval = setInterval(collectMetrics, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const collectMetrics = async () => {
    try {
      console.log('📊 SUPABASE MONITORING - Collecte des métriques...');
      
      const startTime = Date.now();

      // Compter les campagnes
      const { count: campaignsCount, error: campaignsError } = await supabase
        .from('campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.uid);

      if (campaignsError) throw campaignsError;

      // Compter les affiliés
      const { count: affiliatesCount, error: affiliatesError } = await supabase
        .from('affiliates')
        .select('*, campaigns!inner(*)', { count: 'exact', head: true })
        .eq('campaigns.user_id', user!.uid);

      if (affiliatesError && affiliatesError.code !== 'PGRST116') {
        console.warn('Erreur comptage affiliés (non critique):', affiliatesError);
      }

      // Compter les clics
      const { count: clicksCount, error: clicksError } = await supabase
        .from('clicks')
        .select('*, campaigns!inner(*)', { count: 'exact', head: true })
        .eq('campaigns.user_id', user!.uid);

      if (clicksError && clicksError.code !== 'PGRST116') {
        console.warn('Erreur comptage clics (non critique):', clicksError);
      }

      // Compter les conversions et calculer le revenu
      const { data: conversions, error: conversionsError } = await supabase
        .from('conversions')
        .select('amount, campaigns!inner(*)')
        .eq('campaigns.user_id', user!.uid);

      if (conversionsError && conversionsError.code !== 'PGRST116') {
        console.warn('Erreur chargement conversions (non critique):', conversionsError);
      }

      const totalRevenue = conversions?.reduce((sum, conv) => sum + (Number(conv.amount) || 0), 0) || 0;

      // Calculer le temps de réponse
      const responseTime = Date.now() - startTime;

      // Charger les erreurs récentes depuis les logs de sécurité
      const { data: recentErrors } = await supabase
        .from('security_audit_logs')
        .select('event_data, created_at, severity')
        .eq('user_id', user!.uid)
        .in('severity', ['high', 'critical'])
        .order('created_at', { ascending: false })
        .limit(10);

      const formattedErrors = recentErrors?.map(error => ({
        message: (error.event_data as any)?.message || 'Unknown error',
        timestamp: new Date(error.created_at),
        severity: error.severity
      })) || [];

      setMetrics({
        totalCampaigns: campaignsCount || 0,
        totalAffiliates: affiliatesCount || 0,
        totalClicks: clicksCount || 0,
        totalConversions: conversions?.length || 0,
        totalRevenue,
        avgResponseTime: responseTime,
        errorRate: 0, // À calculer avec plus de données
        activeUsers: 1, // Pour l'instant, juste l'utilisateur connecté
        storageUsage: 0, // Métrique non disponible directement
        dbConnections: 1, // Connexion active
        recentErrors: formattedErrors
      });

      console.log('✅ SUPABASE MONITORING - Métriques collectées:', {
        campaigns: campaignsCount,
        affiliates: affiliatesCount,
        clicks: clicksCount,
        conversions: conversions?.length,
        revenue: totalRevenue,
        responseTime
      });

    } catch (error) {
      console.error('❌ SUPABASE MONITORING - Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshMetrics = () => {
    setIsLoading(true);
    collectMetrics();
  };

  return {
    metrics,
    isLoading,
    refreshMetrics
  };
};