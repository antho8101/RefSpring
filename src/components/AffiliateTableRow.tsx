
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
      <TableCell>
        <div className="space-y-1">
          <div className="font-medium text-slate-900">{affiliate.name}</div>
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
        <StripeConnectButton affiliate={affiliate} />
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit(affiliate)}
            className="rounded-xl"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onCopyTrackingLink(affiliate.id)}
            className="rounded-xl"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <div className="ml-3 border-l border-slate-200 pl-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onDelete(affiliate)}
              className="rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
};
