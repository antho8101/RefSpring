
import { FirebaseError } from 'firebase/app';
import { 
  AppError, 
  NetworkError, 
  AuthError, 
  ValidationError, 
  PermissionError, 
  NotFoundError, 
  ServerError,
  ErrorContext 
} from '@/types/errors';

export const mapFirebaseError = (error: FirebaseError, context: Partial<ErrorContext> = {}): AppError => {
  console.error('Firebase Error:', error.code, error.message);

  switch (error.code) {
    // Erreurs d'authentification
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-email':
    case 'auth/user-disabled':
    case 'auth/invalid-credential':
      return new AuthError(error.message, context);

    case 'auth/too-many-requests':
      return new AuthError('Trop de tentatives. Veuillez réessayer plus tard.', context);

    case 'auth/network-request-failed':
      return new NetworkError('Problème de réseau lors de l\'authentification', context);

    // Erreurs de permissions Firestore
    case 'permission-denied':
      return new PermissionError('Accès refusé à cette ressource', context);

    // Erreurs de validation
    case 'invalid-argument':
      return new ValidationError('Données invalides', context);

    // Erreurs de ressources introuvables
    case 'not-found':
      return new NotFoundError('Ressource introuvable', context);

    // Erreurs réseau et serveur
    case 'unavailable':
    case 'deadline-exceeded':
      return new NetworkError('Service temporairement indisponible', context);

    case 'internal':
    case 'unknown':
      return new ServerError('Erreur interne du serveur', context);

    // Erreurs de quota
    case 'resource-exhausted':
      return new ServerError('Quota dépassé. Veuillez réessayer plus tard.', context);

    default:
      return new AppError(
        error.message,
        undefined,
        undefined,
        context,
        error.code.includes('network') || error.code.includes('unavailable')
      );
  }
};

export const mapGenericError = (error: unknown, context: Partial<ErrorContext> = {}): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof FirebaseError) {
    return mapFirebaseError(error, context);
  }

  if (error instanceof Error) {
    // Détecter les erreurs réseau communes
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return new NetworkError(error.message, context);
    }

    return new AppError(error.message, undefined, undefined, context);
  }

  return new AppError('Erreur inconnue', undefined, undefined, context);
};
