
import { RefSpringLogo } from "@/components/RefSpringLogo";
import { Badge } from "@/components/ui/badge";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from "react-i18next";

interface PublicDashboardHeaderProps {
  campaignName: string;
  loading: boolean;
}

export const PublicDashboardHeader = ({ campaignName, loading }: PublicDashboardHeaderProps) => {
  const { t } = useTranslation();
  
  return (
    <header className="w-full bg-gradient-to-r from-blue-50 via-white to-purple-50 border-b border-slate-200/80 shadow-sm">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <RefSpringLogo width="36" height="36" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {t('publicDashboard.header.title')}
                </h1>
                <p className="text-sm text-slate-600 font-medium">{t('publicDashboard.header.subtitle')}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <Badge 
              variant="outline" 
              className="bg-white/80 border-blue-200 text-blue-700 font-medium px-4 py-2"
            >
              {loading ? t('publicDashboard.header.loading') : (campaignName || t('publicDashboard.header.campaign'))}
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
};
