import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface InfoTooltipProps {
  text: string;
}

export const InfoTooltip = ({ text }: InfoTooltipProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="h-3 w-3 text-blue-500/70 cursor-help" />
      </TooltipTrigger>
      <TooltipContent className="!text-foreground">
        <p className="text-xs">{text}</p>
      </TooltipContent>
    </Tooltip>
  );
};