
import { useAuth } from '@/hooks/useAuth';
import { useCampaigns } from '@/hooks/useCampaigns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AuthForm } from '@/components/AuthForm';
import { CampaignCard } from '@/components/CampaignCard';
import { CreateCampaignDialog } from '@/components/CreateCampaignDialog';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useToast } from '@/hooks/use-toast';
import { LogOut, BarChart3, TrendingUp, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const { campaigns, loading } = useCampaigns();
  const { toast } = useToast();
  const { t } = useTranslation();

  if (!user) {
    return <AuthForm />;
  }

  const handleCopyUrl = async (campaignId: string) => {
    const url = `${window.location.origin}/r/${campaignId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: t('campaigns.linkCopied'),
        description: t('campaigns.linkCopiedDesc'),
      });
    } catch (error) {
      toast({
        title: t('notifications.copyError'),
        description: t('notifications.selectAndCopy'),
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      toast({
        title: t('common.success'),
        description: "Disconnected successfully",
      });
    } catch (error) {
      toast({
        title: t('common.error'),
        description: "Error signing out",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">
                  {t('dashboard.title')}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 hidden sm:block">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <LanguageSelector />
              <Button 
                variant="ghost" 
                onClick={handleSignOut}
                size="sm"
                className="text-slate-600 hover:text-slate-900"
              >
                <LogOut className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{t('auth.signOut')}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="bg-white/60 backdrop-blur-sm border-slate-200/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                {t('dashboard.campaigns')}
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-slate-900">
                {loading ? '...' : campaigns.length}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {t('common.active').toLowerCase()}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-slate-200/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                {t('dashboard.affiliates')}
              </CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-slate-900">
                {loading ? '...' : '0'}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {t('stats.activeAffiliates')}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-slate-200/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                {t('dashboard.stats')}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-slate-900">
                {loading ? '...' : '0'}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {t('stats.totalClicks').toLowerCase()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Campaigns Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
              {t('campaigns.title')}
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              {t('dashboard.overview')}
            </p>
          </div>
          <CreateCampaignDialog />
        </div>

        <Separator className="mb-6 sm:mb-8" />

        {/* Campaigns List */}
        {loading ? (
          <div className="space-y-4 sm:space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="bg-white/60 backdrop-blur-sm">
                <CardContent className="p-4 sm:p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    <div className="flex gap-4">
                      <div className="h-8 bg-slate-200 rounded w-16"></div>
                      <div className="h-8 bg-slate-200 rounded w-16"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <Card className="bg-white/60 backdrop-blur-sm border-slate-200/50">
            <CardContent className="text-center py-8 sm:py-12">
              <BarChart3 className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-4 text-slate-400" />
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">
                {t('campaigns.noCampaigns')}
              </h3>
              <p className="text-sm sm:text-base text-slate-600 mb-6">
                {t('campaigns.createFirst')}
              </p>
              <CreateCampaignDialog />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {campaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onCopyUrl={handleCopyUrl}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
