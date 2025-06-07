
import { useAffiliates } from '@/hooks/useAffiliates';
import { AffiliatesTable } from '@/components/AffiliatesTable';
import { useToast } from '@/hooks/use-toast';

interface AffiliatesListProps {
  campaignId: string;
  onCopyTrackingLink?: (affiliateId: string) => void;
}

export const AffiliatesList = ({ campaignId, onCopyTrackingLink }: AffiliatesListProps) => {
  const { affiliates, loading, deleteAffiliate } = useAffiliates(campaignId);
  const { toast } = useToast();

  const handleCopyTrackingLink = (affiliateId: string) => {
    if (onCopyTrackingLink) {
      onCopyTrackingLink(affiliateId);
    }
  };

  const handleDeleteAffiliate = async (affiliateId: string) => {
    try {
      await deleteAffiliate(affiliateId);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer l'affilié",
        variant: "destructive",
      });
    }
  };

  return (
    <AffiliatesTable
      affiliates={affiliates}
      loading={loading}
      onCopyTrackingLink={handleCopyTrackingLink}
      onDeleteAffiliate={handleDeleteAffiliate}
    />
  );
};
