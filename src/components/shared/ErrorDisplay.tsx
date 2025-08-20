import { memo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ErrorDisplayProps {
  error: string | Error;
  onRetry?: () => void;
  retryText?: string;
  className?: string;
  variant?: 'destructive' | 'default';
  icon?: ReactNode;
  showRetry?: boolean;
}

export const ErrorDisplay = memo<ErrorDisplayProps>(({ 
  error,
  onRetry,
  retryText = 'Réessayer',
  className,
  variant = 'destructive',
  icon = <AlertCircle className="h-4 w-4" />,
  showRetry = true
}) => {
  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <Alert variant={variant} className={className}>
      {icon}
      <AlertDescription className="flex items-center justify-between">
        <span>{errorMessage}</span>
        {showRetry && onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="ml-4"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            {retryText}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
});

ErrorDisplay.displayName = 'ErrorDisplay';