
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppError, ErrorSeverity } from '@/types/errors';
import { mapGenericError } from '@/utils/errorMapper';

interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  throwError?: boolean;
}

export const useErrorHandler = () => {
  const { toast } = useToast();

  const handleError = useCallback((
    error: unknown,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      logError = true,
      throwError = false
    } = options;

    const appError = mapGenericError(error);

    // Log l'erreur
    if (logError) {
      console.group(`🚨 ${appError.severity} Error`);
      console.error('Type:', appError.type);
      console.error('Message:', appError.message);
      console.error('User Message:', appError.userMessage);
      console.error('Context:', appError.context);
      console.error('Retryable:', appError.retryable);
      console.error('Stack:', appError.stack);
      console.groupEnd();

      // TODO: Envoyer à un service de monitoring (Sentry, LogRocket, etc.)
      // sendToMonitoring(appError);
    }

    // Afficher le toast selon la sévérité
    if (showToast) {
      const variant = appError.severity === ErrorSeverity.CRITICAL || 
                    appError.severity === ErrorSeverity.HIGH ? 'destructive' : 'default';

      toast({
        variant,
        title: getErrorTitle(appError.severity),
        description: appError.userMessage,
        duration: appError.severity === ErrorSeverity.LOW ? 3000 : 5000,
      });
    }

    // Relancer l'erreur si demandé
    if (throwError) {
      throw appError;
    }

    return appError;
  }, [toast]);

  const getErrorTitle = (severity: ErrorSeverity): string => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return 'Erreur critique';
      case ErrorSeverity.HIGH:
        return 'Erreur importante';
      case ErrorSeverity.MEDIUM:
        return 'Attention';
      case ErrorSeverity.LOW:
        return 'Information';
      default:
        return 'Erreur';
    }
  };

  return { handleError };
};
