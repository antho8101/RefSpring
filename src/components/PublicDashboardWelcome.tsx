
import { TrendingUp, Zap, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PublicDashboardWelcomeProps {
  campaignName: string;
  loading: boolean;
}

export const PublicDashboardWelcome = ({ campaignName, loading }: PublicDashboardWelcomeProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="relative mb-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 rounded-2xl"></div>
      <div className="relative bg-white/60 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {loading ? t('loading') : t('publicDashboard.welcome.title', { campaignName: campaignName || t('publicDashboard.header.campaign') })}
                </h2>
                <p className="text-slate-600 font-medium">{t('publicDashboard.welcome.subtitle')}</p>
              </div>
            </div>
            
            <p className="text-slate-700 leading-relaxed mb-4">
              {t('publicDashboard.welcome.description')}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-blue-600">
                <Zap className="h-4 w-4" />
                <span className="font-medium">{t('publicDashboard.welcome.features.realTime')}</span>
              </div>
              <div className="flex items-center gap-2 text-purple-600">
                <Eye className="h-4 w-4" />
                <span className="font-medium">{t('publicDashboard.welcome.features.analytics')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
