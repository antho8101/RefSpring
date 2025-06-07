
import { useAffiliates } from '@/hooks/useAffiliates';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, User, Calendar, Hash, Edit2, Trash2, BarChart3, MousePointer, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState } from 'react';
import { AffiliateManagementDialog } from '@/components/AffiliateManagementDialog';
import { Affiliate } from '@/types';
import { useAffiliateStats } from '@/hooks/useAffiliateStats';

interface AffiliatesListProps {
  campaignId: string;
  onCopyTrackingLink?: (affiliateId: string) => void;
}

const AffiliateStatsCard = ({ affiliateId }: { affiliateId: string }) => {
  const { stats, loading } = useAffiliateStats(affiliateId);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const conversionRate = stats.clicks > 0 ? ((stats.conversions / stats.clicks) * 100) : 0;

  if (loading) {
    return (
      <div className="flex gap-4 text-xs text-slate-500">
        <div className="animate-pulse">Chargement stats...</div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 text-xs">
      <div className="flex items-center gap-1 text-blue-600">
        <MousePointer className="h-3 w-3" />
        <span className="font-medium">{stats.clicks}</span>
        <span className="text-slate-500">clics</span>
      </div>
      <div className="flex items-center gap-1 text-green-600">
        <TrendingUp className="h-3 w-3" />
        <span className="font-medium">{stats.conversions}</span>
        <span className="text-slate-500">conv.</span>
      </div>
      <div className="flex items-center gap-1 text-purple-600">
        <BarChart3 className="h-3 w-3" />
        <span className="font-medium">{formatCurrency(stats.commissions)}</span>
      </div>
      <div className="flex items-center gap-1 text-orange-600">
        <span className="font-medium">{conversionRate.toFixed(1)}%</span>
        <span className="text-slate-500">taux</span>
      </div>
    </div>
  );
};

export const AffiliatesList = ({ campaignId, onCopyTrackingLink }: AffiliatesListProps) => {
  const { affiliates, loading } = useAffiliates(campaignId);
  const { toast } = useToast();
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [dialogMode, setDialogMode] = useState<'edit' | 'delete'>('edit');

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-slate-100 h-20 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (affiliates.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="h-12 w-12 mx-auto mb-4 text-slate-400" />
        <p className="text-slate-600 font-medium">Aucun affilié pour cette campagne</p>
        <p className="text-slate-500 text-sm">Les affiliés apparaîtront ici une fois ajoutés</p>
      </div>
    );
  }

  const handleCopyTrackingLink = (affiliateId: string) => {
    if (onCopyTrackingLink) {
      onCopyTrackingLink(affiliateId);
    }
  };

  const handleEditAffiliate = (affiliate: Affiliate) => {
    setSelectedAffiliate(affiliate);
    setDialogMode('edit');
  };

  return (
    <>
      <div className="space-y-3">
        {affiliates.map((affiliate) => (
          <div
            key={affiliate.id}
            className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h4 className="font-medium text-slate-900">{affiliate.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {affiliate.email}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {affiliate.commissionRate}%
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                  <div className="flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    <span className="font-mono">{affiliate.trackingCode}</span>
                  </div>
                  {affiliate.createdAt && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{format(affiliate.createdAt, 'dd MMM yyyy', { locale: fr })}</span>
                    </div>
                  )}
                </div>

                {/* Nouvelles statistiques */}
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4 w-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-700">Performances</span>
                  </div>
                  <AffiliateStatsCard affiliateId={affiliate.id} />
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEditAffiliate(affiliate)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleCopyTrackingLink(affiliate.id)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copier le lien
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedAffiliate && (
        <AffiliateManagementDialog
          affiliate={selectedAffiliate}
          open={!!selectedAffiliate}
          onOpenChange={(open) => !open && setSelectedAffiliate(null)}
          mode={dialogMode}
        />
      )}
    </>
  );
};
