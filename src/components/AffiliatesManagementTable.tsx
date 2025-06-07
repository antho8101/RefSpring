
import { useAffiliates } from '@/hooks/useAffiliates';
import { Hash } from 'lucide-react';
import { useState } from 'react';
import { AffiliateManagementDialog } from '@/components/AffiliateManagementDialog';
import { AffiliateDeleteDialog } from '@/components/AffiliateDeleteDialog';
import { AffiliateTableRow } from '@/components/AffiliateTableRow';
import { Affiliate } from '@/types';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface AffiliatesManagementTableProps {
  campaignId: string;
  onCopyTrackingLink?: (affiliateId: string) => void;
}

export const AffiliatesManagementTable = ({ campaignId, onCopyTrackingLink }: AffiliatesManagementTableProps) => {
  const { affiliates, loading } = useAffiliates(campaignId);
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [affiliateToDelete, setAffiliateToDelete] = useState<Affiliate | null>(null);

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
      <div className="text-center py-12">
        <div className="text-slate-400 mb-4">
          <Hash className="h-12 w-12 mx-auto" />
        </div>
        <p className="text-slate-600 font-medium">Aucun affilié pour cette campagne</p>
        <p className="text-slate-500 text-sm mt-1">Les affiliés apparaîtront ici une fois ajoutés</p>
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
  };

  const handleDeleteClick = (affiliate: Affiliate) => {
    setAffiliateToDelete(affiliate);
  };

  return (
    <>
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Affilié</TableHead>
              <TableHead>Code de suivi</TableHead>
              <TableHead>Date d'ajout</TableHead>
              <TableHead>Performances</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {affiliates.map((affiliate) => (
              <AffiliateTableRow
                key={affiliate.id}
                affiliate={affiliate}
                onEdit={handleEditAffiliate}
                onCopyTrackingLink={handleCopyTrackingLink}
                onDelete={handleDeleteClick}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedAffiliate && (
        <AffiliateManagementDialog
          affiliate={selectedAffiliate}
          open={!!selectedAffiliate}
          onOpenChange={(open) => !open && setSelectedAffiliate(null)}
          mode="edit"
        />
      )}

      <AffiliateDeleteDialog
        affiliate={affiliateToDelete}
        open={!!affiliateToDelete}
        onOpenChange={(open) => !open && setAffiliateToDelete(null)}
        campaignId={campaignId}
      />
    </>
  );
};
