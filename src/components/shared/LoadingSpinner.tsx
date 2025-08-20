import { memo } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6', 
  lg: 'h-8 w-8'
};

export const LoadingSpinner = memo<LoadingSpinnerProps>(({ 
  size = 'md', 
  className, 
  text 
}) => {
  if (text) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className={cn(sizeClasses[size], 'animate-spin', className)} />
        <span className="text-sm">{text}</span>
      </div>
    );
  }

  return (
    <Loader2 className={cn(sizeClasses[size], 'animate-spin', className)} />
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';