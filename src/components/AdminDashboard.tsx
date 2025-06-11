
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Users, Activity, Database, TrendingUp, AlertTriangle } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AdminStats {
  totalUsers: number;
  totalCampaigns: number;
  activeCampaigns: number;
  totalAffiliates: number;
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  recentActivity: any[];
}

export const AdminDashboard = () => {
  const { currentEmail, adminEmail } = useAdminAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalAffiliates: 0,
    totalClicks: 0,
    totalConversions: 0,
    totalRevenue: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    try {
      console.log('🔒 ADMIN - Loading global platform stats');

      // Récupérer toutes les campagnes avec leurs données complètes
      const campaignsSnapshot = await getDocs(collection(db, 'campaigns'));
      const campaigns = campaignsSnapshot.docs.map(doc => {
        const data = doc.data();
        return { 
          id: doc.id, 
          userId: data.userId,
          isActive: data.isActive,
          ...data 
        };
      });
      
      // Récupérer tous les affiliés
      const affiliatesSnapshot = await getDocs(collection(db, 'affiliates'));
      
      // Récupérer tous les clics
      const clicksSnapshot = await getDocs(collection(db, 'clicks'));
      
      // Récupérer toutes les conversions
      const conversionsSnapshot = await getDocs(collection(db, 'conversions'));
      const conversions = conversionsSnapshot.docs.map(doc => doc.data());

      // Calculer le CA total
      const totalRevenue = conversions.reduce((sum, conv) => {
        return sum + (parseFloat(conv.amount) || 0);
      }, 0);

      // Activité récente (dernières conversions)
      const recentConversions = await getDocs(
        query(collection(db, 'conversions'), orderBy('timestamp', 'desc'), limit(10))
      );

      setStats({
        totalUsers: new Set(campaigns.map(c => c.userId)).size,
        totalCampaigns: campaigns.length,
        activeCampaigns: campaigns.filter(c => c.isActive).length,
        totalAffiliates: affiliatesSnapshot.size,
        totalClicks: clicksSnapshot.size,
        totalConversions: conversions.length,
        totalRevenue,
        recentActivity: recentConversions.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })),
      });

      console.log('✅ ADMIN - Stats loaded successfully');
    } catch (error) {
      console.error('❌ ADMIN - Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des statistiques admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Admin */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-red-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrateur</h1>
              <p className="text-sm text-gray-600">RefSpring - Accès privé</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Connecté en tant qu'admin</p>
            <p className="text-sm font-medium text-gray-900">{currentEmail}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Alerte de sécurité */}
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <p className="text-sm text-red-800">
                <strong>Zone Administrateur :</strong> Cet accès est strictement limité à {adminEmail}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques globales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs Total</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Campagnes</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeCampaigns} actives
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Affiliés</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAffiliates}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CA Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'EUR'
                }).format(stats.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.totalConversions} conversions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Actions Administrateur</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              <Button 
                variant="outline" 
                onClick={() => window.open('https://console.firebase.google.com', '_blank')}
              >
                Console Firebase
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.open('https://vercel.com/dashboard', '_blank')}
              >
                Dashboard Vercel
              </Button>
              <Button 
                variant="outline" 
                onClick={loadAdminStats}
              >
                Rafraîchir les stats
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Activité récente */}
        <Card>
          <CardHeader>
            <CardTitle>Activité Récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Conversion - {activity.affiliateId}</p>
                      <p className="text-sm text-gray-600">
                        Campagne: {activity.campaignId}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR'
                        }).format(parseFloat(activity.amount) || 0)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.timestamp?.toDate?.()?.toLocaleDateString() || 'Date inconnue'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Aucune activité récente</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
