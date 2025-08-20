import { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface CustomInfoTooltipProps {
  text: string;
}

export const CustomInfoTooltip = ({ text }: CustomInfoTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <HelpCircle 
        className="h-3 w-3 text-muted-foreground cursor-help" 
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      />
      {isVisible && (
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-slate-900 text-white text-xs rounded-md shadow-lg z-50 w-48 text-left whitespace-normal">
          {text}
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
        </div>
      )}
    </div>
  );
};