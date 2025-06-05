
import { Globe, TrendingUp, Shield, Award } from "lucide-react";
import { useTranslation } from 'react-i18next';

export const StatsSection = () => {
  const { t } = useTranslation();

  const stats = [
    { number: "10K+", label: t('stats.activeCampaigns'), icon: <Globe className="w-8 h-8" /> },
    { number: "€50M+", label: t('stats.revenueGenerated'), icon: <TrendingUp className="w-8 h-8" /> },
    { number: "99.9%", label: t('stats.uptime'), icon: <Shield className="w-8 h-8" /> },
    { number: "€0", label: t('stats.upfrontCosts'), icon: <Award className="w-8 h-8" /> }
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20"></div>
      <div className="max-w-7xl mx-auto text-center relative z-10">
        <h2 className="text-4xl font-bold text-white mb-4">
          {t('stats.title')}
        </h2>
        <p className="text-xl text-slate-300 mb-16 max-w-2xl mx-auto">
          {t('stats.subtitle')}
        </p>
        <div className="grid md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="flex justify-center mb-4 text-blue-400 group-hover:text-blue-300 transition-colors">
                {stat.icon}
              </div>
              <div className="text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform">{stat.number}</div>
              <div className="text-xl text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
