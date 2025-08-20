
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CopyButtonProps {
  text: string;
  itemKey: string;
  label: string;
  copiedItems: Set<string>;
  setCopiedItems: (fn: (prev: Set<string>) => Set<string>) => void;
}

export const CopyButton = ({ 
  text, 
  itemKey, 
  label, 
  copiedItems, 
  setCopiedItems 
}: CopyButtonProps) => {
  const { toast } = useToast();
  const isCopied = copiedItems.has(itemKey);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems(prev => new Set([...prev, itemKey]));
      
      toast({
        title: "Copié !",
        description: `${label} copié dans le presse-papiers`,
      });

      // Reset le statut après 2 secondes
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemKey);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier dans le presse-papiers",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant="outline"
      onClick={copyToClipboard}
      className="px-2 text-xs h-5 min-h-5 py-[5px]"
    >
      {isCopied ? (
        <>
          <Check className="h-4 w-4 mr-1 text-green-600" />
          Copié
        </>
      ) : (
        <>
          <Copy className="h-4 w-4 mr-1" />
          Copier
        </>
      )}
    </Button>
  );
};
