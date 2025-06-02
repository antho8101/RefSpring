
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAffiliates } from '@/hooks/useAffiliates';
import { useToast } from '@/hooks/use-toast';
import { Copy, Mail, Percent, User, Link, Calendar } from 'lucide-react';

interface AffiliatesListProps {
  campaignId: string;
}

export const AffiliatesList = ({ campaignId }: AffiliatesListProps) => {
  const { affiliates, loading } = useAffiliates(campaignId);
  const { toast } = useToast();

  const copyAffiliateLink = (trackingCode: string) => {
    const affiliateLink = `https://refspring.com/track/${campaignId}/${trackingCode}`;
    navigator.clipboard.writeText(affiliateLink);
    toast({
      title: "Lien d'affilié copié",
      description: "Le lien de tracking unique a été copié dans le presse-papiers",
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse bg-gradient-to-br from-white to-slate-50/50 border-slate-200/50 shadow-lg">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (affiliates.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-white to-slate-50/50 border-slate-200/50 shadow-xl backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="p-4 bg-blue-100 rounded-full mb-4">
            <User className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Aucun affilié</h3>
          <p className="text-slate-600 text-center text-sm">
            Ajoutez votre premier affilié pour commencer à générer des ventes.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {affiliates.map((affiliate, index) => (
        <Card 
          key={affiliate.id} 
          className="bg-gradient-to-br from-white to-slate-50/50 border-slate-200/50 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] backdrop-blur-sm animate-fade-in"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    {affiliate.name}
                    <Badge 
                      variant={affiliate.isActive ? "default" : "secondary"}
                      className={affiliate.isActive 
                        ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-0" 
                        : "bg-slate-200 text-slate-600"
                      }
                    >
                      {affiliate.isActive ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <Mail className="h-4 w-4" />
                  {affiliate.email}
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => copyAffiliateLink(affiliate.trackingCode)}
                className="hover:scale-105 transition-all shadow-lg backdrop-blur-sm border-slate-300"
                title="Copier le lien de tracking de cet affilié"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copier le lien
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50/50 p-3 rounded-xl">
                <div className="flex items-center gap-2 text-green-600 mb-1">
                  <Percent className="h-4 w-4" />
                  <span className="text-sm font-medium">Commission</span>
                </div>
                <p className="text-xl font-bold text-slate-900">{affiliate.commissionRate}%</p>
              </div>
              
              <div className="bg-blue-50/50 p-3 rounded-xl">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <Link className="h-4 w-4" />
                  <span className="text-sm font-medium">Code de tracking</span>
                </div>
                <p className="font-mono text-xs text-slate-600 truncate bg-white/70 px-2 py-1 rounded">
                  {affiliate.trackingCode}
                </p>
              </div>
              
              <div className="bg-purple-50/50 p-3 rounded-xl">
                <div className="flex items-center gap-2 text-purple-600 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">Ajouté le</span>
                </div>
                <p className="text-sm font-semibold text-slate-900">
                  {new Date(affiliate.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
