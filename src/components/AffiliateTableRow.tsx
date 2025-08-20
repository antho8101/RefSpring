
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Edit2, X, Hash, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Affiliate } from '@/types';
import { AffiliateStatsCell } from '@/components/AffiliateStatsCell';
import { StripeConnectButton } from '@/components/StripeConnectButton';
import { TableCell, TableRow } from '@/components/ui/table';

interface AffiliateTableRowProps {
  affiliate: Affiliate;
  onEdit: (affiliate: Affiliate) => void;
  onCopyTrackingLink: (affiliateId: string) => void;
  onDelete: (affiliate: Affiliate) => void;
}

export const AffiliateTableRow = ({ affiliate, onEdit, onCopyTrackingLink, onDelete }: AffiliateTableRowProps) => {
  return (
    <TableRow className="hover:bg-slate-50">
      <TableCell className="w-[35%] max-w-0 overflow-hidden">
        <div className="space-y-1">
          <div className="font-medium text-slate-900 truncate">{affiliate.name}</div>
          <Badge variant="outline" className="text-xs truncate max-w-full">
            <span className="truncate">{affiliate.email}</span>
          </Badge>
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
            <Hash className="h-3 w-3 flex-shrink-0" />
            <span className="font-mono truncate">{affiliate.trackingCode}</span>
          </div>
        </div>
      </TableCell>
      <TableCell className="w-[15%] max-w-0 overflow-hidden">
        {affiliate.createdAt && (
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <Calendar className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{format(affiliate.createdAt, 'dd MMM yyyy', { locale: fr })}</span>
          </div>
        )}
      </TableCell>
      <TableCell className="w-[20%] max-w-0 overflow-hidden">
        <AffiliateStatsCell affiliateId={affiliate.id} commissionRate={affiliate.commissionRate} />
      </TableCell>
      <TableCell className="w-[20%]">
        <StripeConnectButton affiliate={affiliate} />
      </TableCell>
      <TableCell className="w-[10%] max-w-0 overflow-hidden">
        <div className="flex items-center justify-end gap-1">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit(affiliate)}
            className="rounded-lg h-8 w-8 p-0"
          >
            <Edit2 className="h-3 w-3" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onCopyTrackingLink(affiliate.id)}
            className="rounded-lg h-8 w-8 p-0"
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onDelete(affiliate)}
            className="rounded-lg h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
