
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  VALIDATION = 'VALIDATION',
  PERMISSION = 'PERMISSION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp: Date;
  userAgent?: string;
  url?: string;
}

export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly severity: ErrorSeverity;
  public readonly context: ErrorContext;
  public readonly retryable: boolean;
  public readonly userMessage: string;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context: Partial<ErrorContext> = {},
    retryable: boolean = false,
    userMessage?: string
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.severity = severity;
    this.retryable = retryable;
    this.userMessage = userMessage || this.getDefaultUserMessage();
    this.context = {
      timestamp: new Date(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...context
    };
  }

  private getDefaultUserMessage(): string {
    switch (this.type) {
      case ErrorType.NETWORK:
        return 'Problème de connexion. Vérifiez votre réseau.';
      case ErrorType.AUTH:
        return 'Problème d\'authentification. Veuillez vous reconnecter.';
      case ErrorType.PERMISSION:
        return 'Vous n\'avez pas les permissions nécessaires.';
      case ErrorType.NOT_FOUND:
        return 'Élément introuvable.';
      case ErrorType.VALIDATION:
        return 'Données invalides.';
      case ErrorType.SERVER:
        return 'Erreur du serveur. Veuillez réessayer plus tard.';
      default:
        return 'Une erreur inattendue s\'est produite.';
    }
  }
}

export class NetworkError extends AppError {
  constructor(message: string, context: Partial<ErrorContext> = {}) {
    super(message, ErrorType.NETWORK, ErrorSeverity.HIGH, context, true);
  }
}

export class AuthError extends AppError {
  constructor(message: string, context: Partial<ErrorContext> = {}) {
    super(message, ErrorType.AUTH, ErrorSeverity.HIGH, context, false);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context: Partial<ErrorContext> = {}) {
    super(message, ErrorType.VALIDATION, ErrorSeverity.MEDIUM, context, false);
  }
}

export class PermissionError extends AppError {
  constructor(message: string, context: Partial<ErrorContext> = {}) {
    super(message, ErrorType.PERMISSION, ErrorSeverity.HIGH, context, false);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, context: Partial<ErrorContext> = {}) {
    super(message, ErrorType.NOT_FOUND, ErrorSeverity.MEDIUM, context, false);
  }
}

export class ServerError extends AppError {
  constructor(message: string, context: Partial<ErrorContext> = {}) {
    super(message, ErrorType.SERVER, ErrorSeverity.HIGH, context, true);
  }
}
