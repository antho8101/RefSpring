
import { RefSpringLogo } from "@/components/RefSpringLogo";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

interface PublicDashboardHeaderProps {
  campaignName: string;
  loading: boolean;
}

export const PublicDashboardHeader = ({ campaignName, loading }: PublicDashboardHeaderProps) => {
  return (
    <header className="bg-gradient-to-r from-blue-50 via-white to-purple-50 border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <RefSpringLogo width="36" height="36" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  RefSpring
                </h1>
                <p className="text-sm text-slate-600 font-medium">Dashboard Affilié</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-amber-600">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Powered by RefSpring</span>
            </div>
          </div>
          
          <Badge 
            variant="outline" 
            className="bg-white/80 border-blue-200 text-blue-700 font-medium px-4 py-2"
          >
            {loading ? 'Chargement...' : (campaignName || 'Campagne')}
          </Badge>
        </div>
      </div>
    </header>
  );
};
