
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { AppError, ErrorSeverity, ErrorType } from '@/types/errors';
import { mapGenericError } from '@/utils/errorMapper';

interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  throwError?: boolean;
}

export const useErrorHandler = () => {
  const { toast } = useToast();
  const { t } = useTranslation();

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
        description: getUserMessage(appError.type, appError.userMessage),
        duration: appError.severity === ErrorSeverity.LOW ? 3000 : 5000,
      });
    }

    // Relancer l'erreur si demandé
    if (throwError) {
      throw appError;
    }

    return appError;
  }, [toast, t]);

  const getErrorTitle = (severity: ErrorSeverity): string => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return t('errors.titles.critical');
      case ErrorSeverity.HIGH:
        return t('errors.titles.high');
      case ErrorSeverity.MEDIUM:
        return t('errors.titles.medium');
      case ErrorSeverity.LOW:
        return t('errors.titles.low');
      default:
        return t('errors.titles.default');
    }
  };

  const getUserMessage = (type: ErrorType, fallbackMessage?: string): string => {
    if (fallbackMessage) {
      return fallbackMessage;
    }

    switch (type) {
      case ErrorType.NETWORK:
        return t('errors.types.network');
      case ErrorType.AUTH:
        return t('errors.types.auth');
      case ErrorType.PERMISSION:
        return t('errors.types.permission');
      case ErrorType.NOT_FOUND:
        return t('errors.types.notFound');
      case ErrorType.VALIDATION:
        return t('errors.types.validation');
      case ErrorType.SERVER:
        return t('errors.types.server');
      default:
        return t('errors.types.unknown');
    }
  };

  return { handleError };
};
