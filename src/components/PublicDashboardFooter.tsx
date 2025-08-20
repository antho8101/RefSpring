
import { RefSpringLogo } from "@/components/RefSpringLogo";
import { ExternalLink, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const PublicDashboardFooter = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="w-full mt-16 border-t border-slate-200 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <RefSpringLogo width="24" height="24" />
              <div className="text-sm">
                <p className="font-medium text-slate-700">{t('publicDashboard.footer.poweredBy')}</p>
                <p className="text-slate-500">{t('publicDashboard.footer.subtitle')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <Zap className="h-4 w-4" />
                <span className="font-medium">{t('publicDashboard.footer.performanceBased')}</span>
              </div>
              
              <a 
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors"
              >
                <span>{t('publicDashboard.footer.createCampaign')}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
          
          {/* Liens légaux */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-sm text-slate-500">
              <Link to="/privacy" className="hover:text-slate-700 transition-colors">
                {t('publicDashboard.footer.links.privacy')}
              </Link>
              <Link to="/terms" className="hover:text-slate-700 transition-colors">
                {t('publicDashboard.footer.links.terms')}
              </Link>
              <Link to="/legal" className="hover:text-slate-700 transition-colors">
                {t('publicDashboard.footer.links.legal')}
              </Link>
              <Link to="/contact" className="hover:text-slate-700 transition-colors">
                {t('publicDashboard.footer.links.contact')}
              </Link>
            </div>
            
            <p className="text-sm text-slate-400">
              {t('publicDashboard.footer.copyright', { year: new Date().getFullYear() })}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
