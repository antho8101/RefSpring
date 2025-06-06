
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Code } from 'lucide-react';
import { CopyButton } from './CopyButton';

interface ConversionCodeSectionProps {
  conversionCode: string;
  copiedItems: Set<string>;
  setCopiedItems: (fn: (prev: Set<string>) => Set<string>) => void;
}

export const ConversionCodeSection = ({ 
  conversionCode, 
  copiedItems, 
  setCopiedItems 
}: ConversionCodeSectionProps) => {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 text-base font-medium">
        <Code className="h-4 w-4" />
        Code de conversion (SÉCURISÉ)
      </Label>
      <p className="text-sm text-muted-foreground">
        Ajoutez ce code sur votre page de confirmation de commande. <strong>Le système attribue automatiquement au bon affilié</strong> grâce à la logique "premier clic gagne".
      </p>
      <div className="relative">
        <Textarea 
          value={conversionCode}
          readOnly 
          className="font-mono text-xs min-h-[160px] resize-none"
        />
        <div className="absolute top-2 right-2">
          <CopyButton 
            text={conversionCode}
            itemKey="conversion"
            label="Code de conversion"
            copiedItems={copiedItems}
            setCopiedItems={setCopiedItems}
          />
        </div>
      </div>
    </div>
  );
};
