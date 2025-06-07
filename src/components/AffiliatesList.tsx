
import { useAffiliates } from '@/hooks/useAffiliates';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, User, Hash, Edit2, X, TrendingUp, Euro } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { AffiliateManagementDialog } from '@/components/AffiliateManagementDialog';
import { Affiliate } from '@/types';
import { useAffiliateStats } from '@/hooks/useAffiliateStats';

interface AffiliatesListProps {
  campaignId: string;
  onCopyTrackingLink?: (affiliateId: string) => void;
}

const AffiliateStatsInline = ({ affiliateId }: { affiliateId: string }) => {
  const { stats, loading } = useAffiliateStats(affiliateId);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const conversionRate = stats.clicks > 0 ? ((stats.conversions / stats.clicks) * 100) : 0;
  const totalRevenue = stats.commissions > 0 ? stats.commissions / 0.1 : 0; // Estimation basée sur commission moyenne 10%

  if (loading) {
    return (
      <div className="flex gap-4 text-sm text-slate-500">
        <div className="animate-pulse">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6 text-sm">
      <div className="flex items-center gap-1 text-purple-600">
        <TrendingUp className="h-4 w-4" />
        <span className="font-medium">{conversionRate.toFixed(1)}%</span>
      </div>
      <div className="flex items-center gap-1 text-emerald-600">
        <Euro className="h-4 w-4" />
        <span className="font-medium">{formatCurrency(totalRevenue)}</span>
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
      <div className="space-y-1">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-slate-100 h-16 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (affiliates.length === 0) {
    return (
      <div className="text-center py-12">
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

  const handleDeleteAffiliate = (affiliate: Affiliate) => {
    setSelectedAffiliate(affiliate);
    setDialogMode('delete');
  };

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <div className="grid grid-cols-12 gap-4 items-center text-sm font-medium text-slate-700">
            <div className="col-span-3">Affilié</div>
            <div className="col-span-2">Code</div>
            <div className="col-span-3">Performance</div>
            <div className="col-span-4 text-right">Actions</div>
          </div>
        </div>

        {/* Affiliates List */}
        <div className="divide-y divide-slate-200">
          {affiliates.map((affiliate) => (
            <div
              key={affiliate.id}
              className="px-6 py-4 hover:bg-slate-50 transition-colors"
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Affilié Info */}
                <div className="col-span-3">
                  <div className="space-y-1">
                    <p className="font-medium text-slate-900">{affiliate.name}</p>
                    <Badge variant="outline" className="text-xs">
                      {affiliate.email}
                    </Badge>
                  </div>
                </div>

                {/* Code de tracking */}
                <div className="col-span-2">
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <Hash className="h-3 w-3" />
                    <span className="font-mono">{affiliate.trackingCode}</span>
                  </div>
                </div>

                {/* Performance */}
                <div className="col-span-3">
                  <AffiliateStatsInline affiliateId={affiliate.id} />
                </div>

                {/* Actions */}
                <div className="col-span-4 flex items-center justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditAffiliate(affiliate)}
                    className="rounded-lg"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCopyTrackingLink(affiliate.id)}
                    className="rounded-lg"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copier le lien
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteAffiliate(affiliate)}
                    className="rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
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
