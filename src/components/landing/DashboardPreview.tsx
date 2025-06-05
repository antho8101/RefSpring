
import { TrendingUp, Users, BarChart3 } from "lucide-react";

export const DashboardPreview = () => {
  return (
    <section id="dashboard" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Votre command center attend
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Un dashboard aussi intuitif que vous ne l'avez jamais eu.
          </p>
        </div>
        
        {/* Mock Dashboard Preview */}
        <div className="relative max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl shadow-2xl border border-slate-700">
            <div className="bg-white rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="ml-auto text-sm text-slate-500">dashboard.refspring.com</div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                    <div className="text-2xl font-bold text-slate-900">€12,847</div>
                  </div>
                  <div className="text-sm text-slate-600">This month's revenue</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-8 h-8 text-green-600" />
                    <div className="text-2xl font-bold text-slate-900">847</div>
                  </div>
                  <div className="text-sm text-slate-600">Active affiliates</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <BarChart3 className="w-8 h-8 text-purple-600" />
                    <div className="text-2xl font-bold text-slate-900">+23%</div>
                  </div>
                  <div className="text-sm text-slate-600">Growth this week</div>
                </div>
              </div>
              
              <div className="h-32 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                <div className="text-slate-600 font-medium">Interactive Analytics Dashboard</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
