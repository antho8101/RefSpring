
import { RefSpringLogo } from "@/components/RefSpringLogo";
import { Badge } from "@/components/ui/badge";
import { CurrencySelector } from "@/components/CurrencySelector";
import { useTranslation } from "react-i18next";

interface PublicDashboardHeaderProps {
  campaignName: string;
  loading: boolean;
}

export const PublicDashboardHeader = ({ campaignName, loading }: PublicDashboardHeaderProps) => {
  const { t } = useTranslation();
  
  return (
    <header className="w-full bg-white border-b border-slate-200">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <RefSpringLogo width="36" height="36" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {t('publicDashboard.header.title')}
                </h1>
                <p className="text-sm text-slate-600 font-medium">{t('publicDashboard.header.subtitle')}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <CurrencySelector />
            <Badge 
              variant="outline" 
              className="bg-white border-slate-200 text-slate-700 font-medium px-4 py-2"
            >
              {loading ? t('publicDashboard.header.loading') : (campaignName || t('publicDashboard.header.campaign'))}
            </Badge>
          </div>
        </div>
      </div>
    </header>
  );
};
