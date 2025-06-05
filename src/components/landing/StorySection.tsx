
import { useTranslation } from 'react-i18next';

export const StorySection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            {t('story.title')}
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            {t('story.subtitle.part1')} <strong>{t('story.subtitle.bold')}</strong>
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              step: "01",
              title: t('story.steps.traditional.title'),
              description: t('story.steps.traditional.description'),
              icon: "❌",
              color: "red"
            },
            {
              step: "02", 
              title: t('story.steps.refspring.title'),
              description: t('story.steps.refspring.description'),
              icon: "✅",
              color: "green"
            },
            {
              step: "03",
              title: t('story.steps.result.title'),
              description: t('story.steps.result.description'),
              icon: "🚀",
              color: "blue"
            }
          ].map((item, index) => (
            <article key={index} className="text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <div className="text-4xl mb-4">{item.icon}</div>
              <div className="text-sm font-bold text-slate-400 mb-2">{item.step}</div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">{item.title}</h3>
              <p className="text-slate-600 leading-relaxed">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
