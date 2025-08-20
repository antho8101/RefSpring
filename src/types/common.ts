/**
 * Types communs utilisés dans l'application
 */

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FormData {
  [key: string]: string | number | boolean | Date | null | undefined;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface StatsPeriod {
  label: string;
  value: 'last-7-days' | 'last-30-days' | 'last-3-months' | 'current-month' | 'current-year';
  startDate: Date;
  endDate: Date;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface CurrencyAmount {
  amount: number;
  currency: string;
  formatted: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  emailVerified: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface ErrorInfo {
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  retryable: boolean;
  context?: Record<string, unknown>;
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type WithId<T> = T & { id: string };
export type WithTimestamps<T> = T & {
  createdAt: Date;
  updatedAt: Date;
};