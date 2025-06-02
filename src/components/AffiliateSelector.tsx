
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Affiliate } from '@/types';
import { useTranslation } from 'react-i18next';

interface AffiliateSelectorProps {
  affiliates: Affiliate[];
  selectedAffiliate: string | null;
  onAffiliateChange: (affiliateId: string) => void;
  loading: boolean;
}

export const AffiliateSelector = ({ 
  affiliates, 
  selectedAffiliate, 
  onAffiliateChange, 
  loading 
}: AffiliateSelectorProps) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="mb-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded w-64"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-2">
        <label htmlFor="affiliate-selector" className="text-sm font-medium">
          {t('affiliates.addToTitle')}:
        </label>
        <div className="w-64">
          <Select 
            value={selectedAffiliate || ''} 
            onValueChange={onAffiliateChange}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('affiliates.addAffiliate')} />
            </SelectTrigger>
            <SelectContent>
              {affiliates.map((affiliate) => (
                <SelectItem key={affiliate.id} value={affiliate.id}>
                  {affiliate.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <p className="text-xs text-gray-500">
        {affiliates.length} {t('affiliates.title').toLowerCase()}
      </p>
    </div>
  );
};
