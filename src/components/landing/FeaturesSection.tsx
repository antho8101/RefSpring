
import { Zap, Users, BarChart3, Shield } from "lucide-react";

export const FeaturesSection = () => {
  const features = [
    {
      icon: <Zap className="h-10 w-10 text-blue-600" />,
      title: "Lightning Fast",
      description: "Set up your affiliate program in minutes, not weeks. One-click deployment.",
      metric: "3 min setup"
    },
    {
      icon: <Users className="h-10 w-10 text-green-600" />,
      title: "Smart Recruitment",
      description: "AI-powered affiliate matching. Find and onboard top performers automatically.",
      metric: "847 affiliates"
    },
    {
      icon: <BarChart3 className="h-10 w-10 text-purple-600" />,
      title: "Real-time Analytics",
      description: "Track performance with crystal-clear insights. Know what's working instantly.",
      metric: "Live tracking"
    },
    {
      icon: <Shield className="h-10 w-10 text-orange-600" />,
      title: "Fraud Protection",
      description: "Advanced AI security to protect against fraudulent activities and fake traffic.",
      metric: "99.9% accuracy"
    }
  ];

  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
            Everything you need to dominate
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Powerful tools designed to help you build and manage successful affiliate programs at scale.
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
