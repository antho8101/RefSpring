
import { Crown, Star, TrendingUp } from 'lucide-react';

interface TopPerformingAffiliate {
  name: string;
  conversionRate: number;
}

interface AdvancedStatsHallOfFameProps {
  topPerformingAffiliate: TopPerformingAffiliate;
  topPerformerRevenue: number;
}

export const AdvancedStatsHallOfFame = ({ 
  topPerformingAffiliate, 
  topPerformerRevenue 
}: AdvancedStatsHallOfFameProps) => {
  return (
    <div className="xl:col-span-1 relative">
      <div className="absolute -inset-2 bg-gradient-to-r from-blue-400/10 via-purple-500/10 to-blue-400/10 rounded-2xl blur-lg animate-pulse" style={{ animationDuration: '3s' }}></div>
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-400/8 via-blue-500/8 to-purple-400/8 rounded-xl blur-md animate-pulse" style={{ animationDelay: '1.5s', animationDuration: '4s' }}></div>
      
      <div className="relative bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-2xl p-6 shadow-2xl border-none h-full overflow-hidden transform hover:scale-[1.01] transition-all duration-700 z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse" style={{ animationDuration: '4s' }}></div>
        
        <div className="absolute top-3 left-3">
          <Star className="h-4 w-4 text-blue-200 fill-current animate-pulse" style={{ animationDuration: '2s' }} />
        </div>
        <div className="absolute top-6 right-6">
          <Star className="h-3 w-3 text-indigo-100 fill-current animate-pulse" style={{ animationDelay: '0.7s', animationDuration: '2.5s' }} />
        </div>
        <div className="absolute bottom-3 right-3">
          <Star className="h-4 w-4 text-purple-200 fill-current animate-pulse" style={{ animationDelay: '1.2s', animationDuration: '3s' }} />
        </div>
        <div className="absolute bottom-6 left-6">
          <Star className="h-2 w-2 text-blue-100 fill-current animate-pulse" style={{ animationDelay: '1.8s', animationDuration: '2.2s' }} />
        </div>

        <div className="relative z-10 h-full flex flex-col justify-center text-center">
          <div className="flex items-center justify-center mb-6">
            <Crown className="h-8 w-8 text-white drop-shadow-lg mr-2 animate-pulse" style={{ animationDuration: '2.5s' }} />
            <h3 className="text-xl font-black text-white drop-shadow-lg">HALL OF FAME</h3>
          </div>

          <div className="mb-6">
            <div className="text-2xl font-black text-white mb-2 drop-shadow-lg break-words">
              {topPerformingAffiliate.name}
            </div>
            <div className="text-sm text-white/90 font-bold">
              🏆 TOP PERFORMER
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
              <div className="text-3xl font-black text-white mb-1 drop-shadow-lg">
                {topPerformingAffiliate.conversionRate.toFixed(1)}%
              </div>
              <div className="text-xs font-bold text-white/90 uppercase tracking-wide">
                Taux de conversion
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
              <div className="text-2xl font-black text-white mb-1 drop-shadow-lg">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                  minimumFractionDigits: 0,
                }).format(topPerformerRevenue)}
              </div>
              <div className="text-xs font-bold text-white/90 uppercase tracking-wide">
                CA rapporté
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center">
            <div className="bg-emerald-500/30 backdrop-blur-sm rounded-full px-3 py-1 border border-emerald-400/50 flex items-center gap-1 animate-pulse" style={{ animationDuration: '2.8s' }}>
              <TrendingUp className="h-3 w-3 text-white" />
              <span className="text-xs font-bold text-white">EN FORME</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
