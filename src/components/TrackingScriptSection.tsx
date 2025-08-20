
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Code } from 'lucide-react';
import { CopyButton } from './CopyButton';

interface TrackingScriptSectionProps {
  trackingScript: string;
  copiedItems: Set<string>;
  setCopiedItems: (fn: (prev: Set<string>) => Set<string>) => void;
}

export const TrackingScriptSection = ({ 
  trackingScript, 
  copiedItems, 
  setCopiedItems 
}: TrackingScriptSectionProps) => {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-base font-medium">
        <Code className="h-4 w-4" />
        Script de tracking
      </Label>
      <p className="text-sm text-muted-foreground">
        Ajoutez ce code dans la section &lt;head&gt; de toutes les pages de votre site.
      </p>
      <div>
        <Textarea 
          value={trackingScript}
          readOnly 
          className="font-mono text-xs min-h-[120px] resize-none"
        />
        <div className="flex justify-end mt-2">
          <CopyButton 
            text={trackingScript}
            itemKey="script"
            label="Script de tracking"
            copiedItems={copiedItems}
            setCopiedItems={setCopiedItems}
          />
        </div>
      </div>
    </div>
  );
};
