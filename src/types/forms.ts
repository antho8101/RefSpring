/**
 * Types pour les formulaires
 */

export interface CampaignFormData {
  name: string;
  description: string;
  targetUrl: string;
  isActive: boolean;
  commissionRate?: number;
  commissionType?: 'percentage' | 'fixed';
  currency?: string;
  paymentMethodId?: string;
}

export interface AffiliateFormData {
  name: string;
  email: string;
  trackingCode: string;
  commissionRate: number;
  isActive: boolean;
}

export interface UserSettingsFormData {
  displayName: string;
  email: string;
  currency: string;
  language: string;
  notifications: {
    email: boolean;
    browser: boolean;
    campaigns: boolean;
    payments: boolean;
  };
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'url' | 'textarea' | 'select' | 'checkbox' | 'switch';
  required?: boolean;
  placeholder?: string;
  description?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: unknown) => boolean | string;
  };
  options?: Array<{ value: string | number; label: string }>;
}

export interface FormState<T = Record<string, unknown>> {
  data: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
}

export type FormChangeHandler<T = Record<string, unknown>> = (
  field: keyof T,
  value: unknown
) => void;