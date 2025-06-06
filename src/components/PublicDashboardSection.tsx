
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'lucide-react';
import { CopyButton } from './CopyButton';

interface PublicDashboardSectionProps {
  publicDashboardUrl: string;
  copiedItems: Set<string>;
  setCopiedItems: (fn: (prev: Set<string>) => Set<string>) => void;
}

export const PublicDashboardSection = ({ 
  publicDashboardUrl, 
  copiedItems, 
  setCopiedItems 
}: PublicDashboardSectionProps) => {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-base font-medium">
        <Link className="h-4 w-4" />
        Dashboard public
      </Label>
      <p className="text-sm text-muted-foreground">
        URL du dashboard public où les affiliés pourront consulter leurs statistiques.
      </p>
      <div className="flex items-center gap-2">
        <Input 
          value={publicDashboardUrl} 
          readOnly 
          className="font-mono text-sm"
        />
        <CopyButton 
          text={publicDashboardUrl}
          itemKey="url"
          label="URL du dashboard public"
          copiedItems={copiedItems}
          setCopiedItems={setCopiedItems}
        />
      </div>
      <p className="text-xs text-amber-600">
        Note: Pour créer des liens de tracking spécifiques à chaque affilié, ajoutez des affiliés à cette campagne.
      </p>
    </div>
  );
};
