/**
 * 🛡️ PRODUCTION LOG CLEANER
 * Secure production logging with sensitive data protection
 */

const SENSITIVE_PATTERNS = [
  /token/i, /key/i, /secret/i, /password/i, /auth/i,
  /api.key/i, /bearer/i, /jwt/i, /session/i, /cookie/i,
  /stripe/i, /shopify/i, /firebase/i, /supabase/i
];

const ALLOWED_LOG_PREFIXES = [
  '🔐 SECURITY:', '⚠️ ERROR:', '🚨 SUSPICIOUS ACTIVITY:', 
  '✅ AUTH:', '🔥 Firebase', '💳 STRIPE:'
];

export const cleanProductionLogs = () => {
  if (import.meta.env.MODE !== 'production') return;

  const originalConsole = { ...console };

  // Override console methods for production
  console.log = (...args) => {
    const message = args.join(' ');
    if (shouldLogInProduction(message)) {
      originalConsole.log(...sanitizeLogArgs(args));
    }
  };

  console.warn = (...args) => {
    const message = args.join(' ');
    if (shouldLogInProduction(message)) {
      originalConsole.warn(...sanitizeLogArgs(args));
    }
  };

  console.error = (...args) => {
    // Always log errors but sanitize them
    originalConsole.error(...sanitizeLogArgs(args));
  };

  // Disable debug and info in production
  console.debug = () => {};
  console.info = (...args) => {
    const message = args.join(' ');
    if (shouldLogInProduction(message)) {
      originalConsole.info(...sanitizeLogArgs(args));
    }
  };
};

function shouldLogInProduction(message: string): boolean {
  // Allow specific security and error messages
  return ALLOWED_LOG_PREFIXES.some(prefix => message.includes(prefix));
}

function sanitizeLogArgs(args: any[]): any[] {
  return args.map(arg => {
    if (typeof arg === 'string') {
      return sanitizeString(arg);
    }
    if (typeof arg === 'object' && arg !== null) {
      return sanitizeObject(arg);
    }
    return arg;
  });
}

function sanitizeString(str: string): string {
  let sanitized = str;
  
  // Mask sensitive data patterns
  SENSITIVE_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[REDACTED]');
  });
  
  return sanitized;
}

function sanitizeObject(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    
    if (SENSITIVE_PATTERNS.some(pattern => pattern.test(lowerKey))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}