// Base domain error class
export abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
  public readonly timestamp: Date;

  constructor(
    message: string,
    public readonly context?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.timestamp = new Date();
    
    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      context: this.context,
      stack: this.stack
    };
  }
}

// Validation errors (400)
export class ValidationError extends DomainError {
  readonly code = 'VALIDATION_ERROR';
  readonly statusCode = 400;

  constructor(
    message: string, 
    public readonly field?: string,
    context?: Record<string, any>
  ) {
    super(message, { ...context, field });
  }
}

// Business logic errors (422)
export class BusinessError extends DomainError {
  readonly code = 'BUSINESS_ERROR';
  readonly statusCode = 422;
}

// Not found errors (404)
export class NotFoundError extends DomainError {
  readonly code = 'NOT_FOUND';
  readonly statusCode = 404;

  constructor(
    resource: string,
    identifier?: string | number,
    context?: Record<string, any>
  ) {
    const message = identifier 
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    
    super(message, { ...context, resource, identifier });
  }
}

// Unauthorized errors (401)
export class UnauthorizedError extends DomainError {
  readonly code = 'UNAUTHORIZED';
  readonly statusCode = 401;
}

// Forbidden errors (403)
export class ForbiddenError extends DomainError {
  readonly code = 'FORBIDDEN';
  readonly statusCode = 403;
}

// Conflict errors (409)
export class ConflictError extends DomainError {
  readonly code = 'CONFLICT';
  readonly statusCode = 409;

  constructor(
    message: string,
    public readonly conflictingResource?: string,
    context?: Record<string, any>
  ) {
    super(message, { ...context, conflictingResource });
  }
}

// Infrastructure errors (500)
export class InfrastructureError extends DomainError {
  readonly code = 'INFRASTRUCTURE_ERROR';
  readonly statusCode = 500;

  constructor(
    message: string,
    public readonly service?: string,
    context?: Record<string, any>
  ) {
    super(message, { ...context, service });
  }
}

// Application errors (500)
export class ApplicationError extends DomainError {
  readonly code = 'APPLICATION_ERROR';
  readonly statusCode = 500;
}

// External service errors (502)
export class ExternalServiceError extends DomainError {
  readonly code = 'EXTERNAL_SERVICE_ERROR';
  readonly statusCode = 502;

  constructor(
    service: string,
    message: string,
    public readonly originalError?: Error,
    context?: Record<string, any>
  ) {
    super(`${service}: ${message}`, { ...context, service, originalError: originalError?.message });
  }
}

// Rate limiting errors (429)
export class RateLimitError extends DomainError {
  readonly code = 'RATE_LIMIT_ERROR';
  readonly statusCode = 429;

  constructor(
    message: string,
    public readonly retryAfter?: number,
    context?: Record<string, any>
  ) {
    super(message, { ...context, retryAfter });
  }
}

// Error factory for common patterns
export class ErrorFactory {
  static validation(message: string, field?: string): ValidationError {
    return new ValidationError(message, field);
  }

  static business(message: string): BusinessError {
    return new BusinessError(message);
  }

  static notFound(resource: string, identifier?: string | number): NotFoundError {
    return new NotFoundError(resource, identifier);
  }

  static unauthorized(message: string = 'Authentication required'): UnauthorizedError {
    return new UnauthorizedError(message);
  }

  static forbidden(message: string = 'Access denied'): ForbiddenError {
    return new ForbiddenError(message);
  }

  static conflict(message: string, resource?: string): ConflictError {
    return new ConflictError(message, resource);
  }

  static infrastructure(message: string, service?: string): InfrastructureError {
    return new InfrastructureError(message, service);
  }

  static externalService(service: string, message: string, originalError?: Error): ExternalServiceError {
    return new ExternalServiceError(service, message, originalError);
  }

  static rateLimit(message: string, retryAfter?: number): RateLimitError {
    return new RateLimitError(message, retryAfter);
  }

  // Convert unknown errors to domain errors
  static fromUnknown(error: unknown, defaultMessage: string = 'Unknown error occurred'): DomainError {
    if (error instanceof DomainError) {
      return error;
    }

    if (error instanceof Error) {
      return new ApplicationError(error.message, { originalError: error.message });
    }

    if (typeof error === 'string') {
      return new ApplicationError(error);
    }

    return new ApplicationError(defaultMessage, { originalError: String(error) });
  }
}

// Error handler utility
export class ErrorHandler {
  static handle(error: DomainError | Error, context?: string): void {
    const domainError = error instanceof DomainError 
      ? error 
      : ErrorFactory.fromUnknown(error);

    // Log error with context
    console.error(`[${context || 'Unknown'}] ${domainError.name}: ${domainError.message}`, {
      code: domainError.code,
      statusCode: domainError.statusCode,
      context: domainError.context,
      timestamp: domainError.timestamp
    });

    // Send to error monitoring service (Sentry, etc.)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(domainError);
    }
  }

  static getUserMessage(error: DomainError): string {
    switch (error.code) {
      case 'VALIDATION_ERROR':
        return error.message;
      case 'BUSINESS_ERROR':
        return error.message;
      case 'NOT_FOUND':
        return 'La ressource demandée est introuvable.';
      case 'UNAUTHORIZED':
        return 'Vous devez vous connecter pour accéder à cette ressource.';
      case 'FORBIDDEN':
        return 'Vous n\'avez pas les permissions nécessaires.';
      case 'CONFLICT':
        return 'Cette action ne peut pas être effectuée en raison d\'un conflit.';
      case 'RATE_LIMIT_ERROR':
        return 'Trop de tentatives. Veuillez réessayer plus tard.';
      case 'EXTERNAL_SERVICE_ERROR':
        return 'Un service externe est temporairement indisponible.';
      default:
        return 'Une erreur inattendue s\'est produite.';
    }
  }
}