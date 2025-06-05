
import { Zap, Users, BarChart3, Shield } from "lucide-react";
import { useTranslation } from 'react-i18next';

export const FeaturesSection = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <Zap className="h-10 w-10 text-blue-600" />,
      title: t('features.lightningFast.title'),
      description: t('features.lightningFast.description'),
      metric: t('features.lightningFast.metric')
    },
    {
      icon: <Users className="h-10 w-10 text-green-600" />,
      title: t('features.smartRecruitment.title'),
      description: t('features.smartRecruitment.description'),
      metric: t('features.smartRecruitment.metric')
    },
    {
      icon: <BarChart3 className="h-10 w-10 text-purple-600" />,
      title: t('features.realTimeAnalytics.title'),
      description: t('features.realTimeAnalytics.description'),
      metric: t('features.realTimeAnalytics.metric')
    },
    {
      icon: <Shield className="h-10 w-10 text-orange-600" />,
      title: t('features.fraudProtection.title'),
      description: t('features.fraudProtection.description'),
      metric: t('features.fraudProtection.metric')
    }
  ];

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            {t('features.title')}
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            {t('features.subtitle')}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="group p-8 rounded-2xl bg-white hover:bg-gradient-to-br hover:from-white hover:to-slate-50 transition-all hover:scale-105 shadow-lg hover:shadow-xl border border-slate-100">
              <div className="mb-6 transform group-hover:scale-110 transition-transform">{feature.icon}</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 mb-4 leading-relaxed">{feature.description}</p>
              <div className="text-sm font-bold text-blue-600">{feature.metric}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
