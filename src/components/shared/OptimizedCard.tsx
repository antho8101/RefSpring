import { memo, forwardRef, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface OptimizedCardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  loading?: boolean;
  error?: string;
  action?: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

const cardVariants = {
  default: 'border-slate-200',
  success: 'border-green-200 bg-green-50/50',
  warning: 'border-orange-200 bg-orange-50/50',
  error: 'border-red-200 bg-red-50/50'
};

export const OptimizedCard = memo(forwardRef<HTMLDivElement, OptimizedCardProps>(
  ({ 
    title, 
    description, 
    children, 
    className, 
    headerClassName, 
    contentClassName,
    loading = false,
    error,
    action,
    variant = 'default',
    ...props 
  }, ref) => {
    if (loading) {
      return (
        <Card ref={ref} className={cn(cardVariants[variant], className)} {...props}>
          <CardHeader className={headerClassName}>
            <div className="animate-pulse space-y-2">
              <div className="h-6 bg-slate-200 rounded w-3/4"></div>
              {description && <div className="h-4 bg-slate-200 rounded w-1/2"></div>}
            </div>
          </CardHeader>
          <CardContent className={contentClassName}>
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 rounded"></div>
              <div className="h-4 bg-slate-200 rounded w-5/6"></div>
              <div className="h-4 bg-slate-200 rounded w-4/6"></div>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (error) {
      return (
        <Card ref={ref} className={cn(cardVariants.error, className)} {...props}>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p className="font-semibold">Erreur</p>
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card ref={ref} className={cn(cardVariants[variant], className)} {...props}>
        {(title || description || action) && (
          <CardHeader className={cn('flex flex-row items-center justify-between', headerClassName)}>
            <div className="space-y-1.5">
              {title && <CardTitle>{title}</CardTitle>}
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            {action}
          </CardHeader>
        )}
        <CardContent className={contentClassName}>
          {children}
        </CardContent>
      </Card>
    );
  }
));

OptimizedCard.displayName = 'OptimizedCard';