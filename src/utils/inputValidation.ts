/**
 * 🛡️ Comprehensive Input Validation and Sanitization
 * Server-side quality validation for all user inputs
 */

import { z } from 'zod';
import { securityMonitoring } from './security';

// Common validation schemas
const emailSchema = z.string()
  .email('Invalid email format')
  .min(3, 'Email too short')
  .max(254, 'Email too long')
  .refine((email) => !email.includes('<script'), 'Invalid email content');

const urlSchema = z.string()
  .url('Invalid URL format')
  .refine((url) => {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }, 'URL must use HTTP or HTTPS protocol')
  .refine((url) => !/<script|javascript:|data:/i.test(url), 'URL contains malicious content');

const nameSchema = z.string()
  .min(2, 'Name too short')
  .max(100, 'Name too long')
  .refine((name) => !/<script|javascript:|on\w+=/i.test(name), 'Name contains invalid characters');

// Input sanitization utilities
export const sanitizeInput = {
  /**
   * Sanitize text input by removing malicious content
   */
  text: (input: string): string => {
    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/data:text\/html/gi, '')
      .substring(0, 10000); // Prevent excessively long inputs
  },

  /**
   * Sanitize HTML content
   */
  html: (input: string): string => {
    const allowedTags = ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'];
    const div = document.createElement('div');
    div.innerHTML = input;
    
    // Remove all script tags and suspicious attributes
    const scripts = div.querySelectorAll('script');
    scripts.forEach(script => script.remove());
    
    // Remove event handlers
    const allElements = div.querySelectorAll('*');
    allElements.forEach(element => {
      const attributes = element.attributes;
      for (let i = attributes.length - 1; i >= 0; i--) {
        const attr = attributes[i];
        if (attr.name.startsWith('on') || attr.value.includes('javascript:')) {
          element.removeAttribute(attr.name);
        }
      }
      
      // Remove non-allowed tags
      if (!allowedTags.includes(element.tagName.toLowerCase())) {
        element.replaceWith(...element.childNodes);
      }
    });
    
    return div.innerHTML;
  },

  /**
   * Sanitize JSON data
   */
  json: (input: any): any => {
    if (typeof input === 'string') {
      return sanitizeInput.text(input);
    }
    
    if (Array.isArray(input)) {
      return input.map(item => sanitizeInput.json(item));
    }
    
    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      Object.keys(input).forEach(key => {
        const sanitizedKey = sanitizeInput.text(key);
        sanitized[sanitizedKey] = sanitizeInput.json(input[key]);
      });
      return sanitized;
    }
    
    return input;
  }
};

// Validation schemas for different data types
export const validationSchemas = {
  // Campaign validation
  campaign: z.object({
    name: nameSchema,
    description: z.string().max(1000).optional(),
    targetUrl: urlSchema,
    commissionRate: z.number().min(0).max(100),
    isActive: z.boolean().default(true)
  }),

  // Affiliate validation
  affiliate: z.object({
    name: nameSchema,
    email: emailSchema,
    commissionRate: z.number().min(0).max(100).optional()
  }),

  // Conversion validation
  conversion: z.object({
    amount: z.number().positive('Amount must be positive').max(1000000),
    affiliateId: z.string().uuid('Invalid affiliate ID'),
    campaignId: z.string().uuid('Invalid campaign ID')
  }),

  // User profile validation
  profile: z.object({
    displayName: nameSchema.optional(),
    email: emailSchema,
    avatarUrl: urlSchema.optional()
  }),

  // Shopify integration validation
  shopifyIntegration: z.object({
    shopDomain: z.string()
      .min(3, 'Shop domain too short')
      .max(100, 'Shop domain too long')
      .refine((domain) => /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.myshopify\.com$/.test(domain), 
        'Invalid Shopify domain format'),
    campaignId: z.string().uuid('Invalid campaign ID')
  })
};

// Rate limiting configuration
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyGenerator: (req: any) => string;
}

class RateLimiter {
  private requests = new Map<string, number[]>();

  constructor(private config: RateLimitConfig) {}

  isAllowed(req: any): boolean {
    const key = this.config.keyGenerator(req);
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Get existing requests for this key
    let timestamps = this.requests.get(key) || [];
    
    // Remove old requests outside the window
    timestamps = timestamps.filter(timestamp => timestamp > windowStart);
    
    // Check if limit is exceeded
    if (timestamps.length >= this.config.maxRequests) {
      securityMonitoring.logSuspiciousActivity({
        type: 'rate_limit_exceeded',
        details: {
          key,
          requestCount: timestamps.length,
          maxRequests: this.config.maxRequests,
          windowMs: this.config.windowMs
        }
      });
      return false;
    }

    // Add current request
    timestamps.push(now);
    this.requests.set(key, timestamps);

    return true;
  }

  // Clean up old entries periodically
  cleanup(): void {
    const now = Date.now();
    this.requests.forEach((timestamps, key) => {
      const validTimestamps = timestamps.filter(
        timestamp => timestamp > now - this.config.windowMs
      );
      
      if (validTimestamps.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validTimestamps);
      }
    });
  }
}

// Pre-configured rate limiters
export const rateLimiters = {
  // API endpoints
  api: new RateLimiter({
    maxRequests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
    keyGenerator: (req) => req.ip || 'unknown'
  }),

  // Authentication endpoints
  auth: new RateLimiter({
    maxRequests: 10,
    windowMs: 15 * 60 * 1000, // 15 minutes
    keyGenerator: (req) => req.ip || 'unknown'
  }),

  // Conversion tracking
  conversion: new RateLimiter({
    maxRequests: 50,
    windowMs: 5 * 60 * 1000, // 5 minutes
    keyGenerator: (req) => req.affiliateId || req.ip || 'unknown'
  }),

  // Shopify operations
  shopify: new RateLimiter({
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minute
    keyGenerator: (req) => req.shopDomain || req.ip || 'unknown'
  })
};

// Validation helpers
export const validateAndSanitize = {
  /**
   * Validate and sanitize campaign data
   */
  campaign: (data: any) => {
    const sanitized = sanitizeInput.json(data);
    const result = validationSchemas.campaign.safeParse(sanitized);
    
    if (!result.success) {
      securityMonitoring.logSuspiciousActivity({
        type: 'invalid_campaign_data',
        details: {
          errors: result.error.errors,
          originalData: JSON.stringify(data).substring(0, 500)
        }
      });
      throw new Error(`Campaign validation failed: ${result.error.errors.map(e => e.message).join(', ')}`);
    }
    
    return result.data;
  },

  /**
   * Validate and sanitize affiliate data
   */
  affiliate: (data: any) => {
    const sanitized = sanitizeInput.json(data);
    const result = validationSchemas.affiliate.safeParse(sanitized);
    
    if (!result.success) {
      securityMonitoring.logSuspiciousActivity({
        type: 'invalid_affiliate_data',
        details: {
          errors: result.error.errors,
          originalData: JSON.stringify(data).substring(0, 500)
        }
      });
      throw new Error(`Affiliate validation failed: ${result.error.errors.map(e => e.message).join(', ')}`);
    }
    
    return result.data;
  },

  /**
   * Validate and sanitize conversion data
   */
  conversion: (data: any) => {
    const sanitized = sanitizeInput.json(data);
    const result = validationSchemas.conversion.safeParse(sanitized);
    
    if (!result.success) {
      securityMonitoring.logSuspiciousActivity({
        type: 'invalid_conversion_data',
        details: {
          errors: result.error.errors,
          originalData: JSON.stringify(data).substring(0, 500)
        }
      });
      throw new Error(`Conversion validation failed: ${result.error.errors.map(e => e.message).join(', ')}`);
    }
    
    return result.data;
  }
};

// Setup cleanup interval for rate limiters
if (typeof window !== 'undefined') {
  setInterval(() => {
    Object.values(rateLimiters).forEach(limiter => limiter.cleanup());
  }, 5 * 60 * 1000); // Cleanup every 5 minutes
}