/**
 * Utilitaires de validation
 */

// Regex patterns
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  PHONE: /^(\+33|0)[1-9](\d{8})$/,
  TRACKING_CODE: /^[A-Z0-9]{6,12}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
} as const;

// Validation functions
export const isValidEmail = (email: string): boolean => {
  return PATTERNS.EMAIL.test(email);
};

export const isValidUrl = (url: string): boolean => {
  return PATTERNS.URL.test(url);
};

export const isValidPhone = (phone: string): boolean => {
  return PATTERNS.PHONE.test(phone);
};

export const isValidTrackingCode = (code: string): boolean => {
  return PATTERNS.TRACKING_CODE.test(code);
};

export const isValidPassword = (password: string): boolean => {
  return PATTERNS.PASSWORD.test(password);
};

export const isValidCommissionRate = (rate: number): boolean => {
  return rate >= 0 && rate <= 100;
};

export const isValidAmount = (amount: number): boolean => {
  return amount >= 0 && amount <= 999999;
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const validateRequired = (value: unknown, fieldName: string): string => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} est requis`;
  }
  return '';
};

export const validateMinLength = (value: string, min: number, fieldName: string): string => {
  if (value.length < min) {
    return `${fieldName} doit contenir au moins ${min} caractères`;
  }
  return '';
};

export const validateMaxLength = (value: string, max: number, fieldName: string): string => {
  if (value.length > max) {
    return `${fieldName} ne peut pas dépasser ${max} caractères`;
  }
  return '';
};

export const validateRange = (value: number, min: number, max: number, fieldName: string): string => {
  if (value < min || value > max) {
    return `${fieldName} doit être entre ${min} et ${max}`;
  }
  return '';
};