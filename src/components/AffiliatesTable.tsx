
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Copy, Edit2, X, Hash, Calendar, TrendingUp, Euro } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState } from 'react';
import { AffiliateManagementDialog } from '@/components/AffiliateManagementDialog';
import { Affiliate } from '@/types';
import { useAffiliateStats } from '@/hooks/useAffiliateStats';

interface AffiliatesTableProps {
  affiliates: Affiliate[];
  loading: boolean;
  onCopyTrackingLink: (affiliateId: string) => void;
  onDeleteAffiliate: (affiliateId: string) => void;
}

const AffiliateStatsCell = ({ affiliateId, commissionRate }: { affiliateId: string; commissionRate: number }) => {
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
  const totalRevenue = stats.commissions / (commissionRate / 100);

  if (loading) {
    return (
      <div className="space-y-1">
        <div className="animate-pulse bg-slate-200 h-4 w-16 rounded"></div>
        <div className="animate-pulse bg-slate-200 h-4 w-20 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1 text-sm">
        <TrendingUp className="h-3 w-3 text-green-600" />
        <span className="font-medium">{conversionRate.toFixed(1)}%</span>
        <span className="text-slate-500 text-xs">conv.</span>
      </div>
      <div className="flex items-center gap-1 text-sm">
        <Euro className="h-3 w-3 text-blue-600" />
        <span className="font-medium">{formatCurrency(totalRevenue)}</span>
        <span className="text-slate-500 text-xs">CA</span>
      </div>
    </div>
  );
};

export const AffiliatesTable = ({ affiliates, loading, onCopyTrackingLink, onDeleteAffiliate }: AffiliatesTableProps) => {
  const { toast } = useToast();
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);

  const handleCopyTrackingLink = (affiliateId: string) => {
    onCopyTrackingLink(affiliateId);
  };

  const handleEditAffiliate = (affiliate: Affiliate) => {
    setSelectedAffiliate(affiliate);
  };

  const handleDeleteAffiliate = (affiliateId: string, affiliateName: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${affiliateName} ? Cette action est irréversible.`)) {
      onDeleteAffiliate(affiliateId);
      toast({
        title: "Affilié supprimé",
        description: `${affiliateName} a été supprimé avec succès`,
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse bg-slate-100 h-16 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (affiliates.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-600 font-medium">Aucun affilié pour cette campagne</p>
        <p className="text-slate-500 text-sm">Les affiliés apparaîtront ici une fois ajoutés</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Affilié</TableHead>
            <TableHead>Code de suivi</TableHead>
            <TableHead>Date d'ajout</TableHead>
            <TableHead>Performances</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {affiliates.map((affiliate) => (
            <TableRow key={affiliate.id}>
              <TableCell>
                <div className="space-y-1">
                  <p className="font-medium text-slate-900">{affiliate.name}</p>
                  <Badge variant="outline" className="text-xs">
                    {affiliate.email}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 text-sm text-slate-600">
                  <Hash className="h-3 w-3" />
                  <span className="font-mono">{affiliate.trackingCode}</span>
                </div>
              </TableCell>
              <TableCell>
                {affiliate.createdAt && (
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <Calendar className="h-3 w-3" />
                    <span>{format(affiliate.createdAt, 'dd MMM yyyy', { locale: fr })}</span>
                  </div>
                )}
              </TableCell>
              <TableCell>
                <AffiliateStatsCell affiliateId={affiliate.id} commissionRate={affiliate.commissionRate} />
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-2">
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
                    onClick={() => handleDeleteAffiliate(affiliate.id, affiliate.name)}
                    className="rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedAffiliate && (
        <AffiliateManagementDialog
          affiliate={selectedAffiliate}
          open={!!selectedAffiliate}
          onOpenChange={(open) => !open && setSelectedAffiliate(null)}
          mode="edit"
        />
      )}
    </>
  );
};
