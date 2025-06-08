
import { Card, CardContent } from "@/components/ui/card";
import { Users, Link2, BarChart3, ArrowRight } from "lucide-react";

interface PublicDashboardEmptyStateProps {
  hasAffiliates: boolean;
}

export const PublicDashboardEmptyState = ({ hasAffiliates }: PublicDashboardEmptyStateProps) => {
  if (!hasAffiliates) {
    return (
      <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50">
        <CardContent className="py-12">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-gradient-to-r from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-3">Aucun affilié pour le moment</h3>
            <p className="text-slate-500 leading-relaxed">
              Cette campagne n'a pas encore d'affiliés configurés. 
              L'administrateur peut en ajouter depuis son dashboard RefSpring !
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50/50 to-purple-50/50 border-blue-100/50">
      <CardContent className="py-12">
        <div className="text-center max-w-lg mx-auto">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
          
          <h3 className="text-2xl font-bold text-slate-900 mb-3">
            Choisissez votre profil d'affilié
          </h3>
          
          <p className="text-slate-600 leading-relaxed mb-6">
            Sélectionnez votre nom dans le menu déroulant ci-dessus pour accéder à votre espace personnalisé 
            avec vos liens de tracking et vos statistiques de performance !
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <div className="text-center p-4 bg-white/60 rounded-xl border border-white/80">
              <Link2 className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">Liens personnalisés</p>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-xl border border-white/80">
              <BarChart3 className="h-6 w-6 text-purple-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">Stats temps réel</p>
            </div>
            <div className="text-center p-4 bg-white/60 rounded-xl border border-white/80">
              <ArrowRight className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">Tracking précis</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
