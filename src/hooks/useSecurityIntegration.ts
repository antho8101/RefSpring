/**
 * 🛡️ Security Integration Hook
 * Integrates client-side security with backend validation
 */

import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { securityMonitoring } from '@/utils/security';

export const useSecurityIntegration = () => {
  
  /**
   * Validate input with server-side validation
   */
  const validateInput = useCallback(async (data: any) => {
    try {
      const { data: validationResult, error } = await supabase.functions.invoke(
        'security-validation',
        {
          body: {
            action: 'validate_input',
            data,
            clientInfo: {
              ip: 'client', // Will be populated by edge function
              userAgent: navigator.userAgent,
              timestamp: Date.now()
            }
          }
        }
      );

      if (error) {
        console.error('🚨 SECURITY: Input validation error:', error);
        securityMonitoring.logSuspiciousActivity({
          type: 'validation_service_error',
          details: { error: error.message, data: JSON.stringify(data).substring(0, 200) }
        });
        return { isValid: false, errors: ['Validation service error'] };
      }

      if (!validationResult.isValid) {
        securityMonitoring.logSuspiciousActivity({
          type: 'invalid_input_detected',
          details: { 
            errors: validationResult.errors,
            dataType: typeof data,
            inputLength: JSON.stringify(data).length
          }
        });
      }

      return validationResult;
      
    } catch (error) {
      console.error('🚨 SECURITY: Validation request failed:', error);
      // Fail closed - reject invalid input
      return { isValid: false, errors: ['Security validation failed'] };
    }
  }, []);

  /**
   * Check permissions with server-side validation
   */
  const checkPermissions = useCallback(async (resourceId: string, resourceType: string) => {
    try {
      const { data: permissionResult, error } = await supabase.functions.invoke(
        'security-validation',
        {
          body: {
            action: 'check_permissions',
            resourceId,
            resourceType,
            clientInfo: {
              ip: 'client',
              userAgent: navigator.userAgent,
              timestamp: Date.now()
            }
          }
        }
      );

      if (error) {
        console.error('🚨 SECURITY: Permission check error:', error);
        securityMonitoring.logSuspiciousActivity({
          type: 'permission_check_error',
          details: { 
            error: error.message, 
            resourceId, 
            resourceType 
          }
        });
        return { hasPermission: false };
      }

      if (!permissionResult.hasPermission) {
        securityMonitoring.logSuspiciousActivity({
          type: 'unauthorized_access_attempt',
          details: { 
            resourceId, 
            resourceType,
            details: permissionResult.details
          }
        });
      }

      return permissionResult;
      
    } catch (error) {
      console.error('🚨 SECURITY: Permission check failed:', error);
      // Fail closed - deny access
      return { hasPermission: false };
    }
  }, []);

  /**
   * Log security event to server
   */
  const logSecurityEvent = useCallback(async (eventType: string, eventData: any) => {
    try {
      const { error } = await supabase.functions.invoke(
        'security-validation',
        {
          body: {
            action: 'log_security_event',
            eventType,
            eventData,
            clientInfo: {
              ip: 'client',
              userAgent: navigator.userAgent,
              timestamp: Date.now()
            }
          }
        }
      );

      if (error) {
        console.error('🚨 SECURITY: Failed to log security event:', error);
        // Continue execution - logging failure shouldn't block operations
      }

    } catch (error) {
      console.error('🚨 SECURITY: Security event logging failed:', error);
    }
  }, []);

  /**
   * Check rate limits
   */
  const checkRateLimit = useCallback(async () => {
    try {
      const { data: rateLimitResult, error } = await supabase.functions.invoke(
        'security-validation',
        {
          body: {
            action: 'check_rate_limit',
            clientInfo: {
              ip: 'client',
              userAgent: navigator.userAgent,
              timestamp: Date.now()
            }
          }
        }
      );

      if (error) {
        console.error('🚨 SECURITY: Rate limit check error:', error);
        // Assume rate limit exceeded on error for safety
        return { allowed: false, error: 'Rate limit check failed' };
      }

      if (!rateLimitResult.allowed) {
        securityMonitoring.logSuspiciousActivity({
          type: 'rate_limit_exceeded',
          details: rateLimitResult
        });
      }

      return rateLimitResult;
      
    } catch (error) {
      console.error('🚨 SECURITY: Rate limit check failed:', error);
      return { allowed: false, error: 'Rate limit check failed' };
    }
  }, []);

  /**
   * Comprehensive security check for sensitive operations
   */
  const performSecurityCheck = useCallback(async (
    operation: string, 
    data?: any, 
    resourceId?: string, 
    resourceType?: string
  ) => {
    console.log(`🔐 SECURITY: Starting comprehensive security check for ${operation}`);

    // 1. Check rate limits
    const rateLimitResult = await checkRateLimit();
    if (!rateLimitResult.allowed) {
      return {
        allowed: false,
        reason: 'rate_limit_exceeded',
        details: rateLimitResult
      };
    }

    // 2. Validate input if provided
    if (data) {
      const validationResult = await validateInput(data);
      if (!validationResult.isValid) {
        return {
          allowed: false,
          reason: 'invalid_input',
          details: validationResult
        };
      }
    }

    // 3. Check permissions if resource specified
    if (resourceId && resourceType) {
      const permissionResult = await checkPermissions(resourceId, resourceType);
      if (!permissionResult.hasPermission) {
        return {
          allowed: false,
          reason: 'insufficient_permissions',
          details: permissionResult
        };
      }
    }

    // 4. Log successful security check
    await logSecurityEvent('security_check_passed', {
      operation,
      hasData: !!data,
      hasResource: !!(resourceId && resourceType),
      rateLimitRemaining: rateLimitResult.remaining
    });

    return {
      allowed: true,
      reason: 'security_check_passed',
      details: {
        rateLimit: rateLimitResult
      }
    };
  }, [validateInput, checkPermissions, checkRateLimit, logSecurityEvent]);

  return {
    validateInput,
    checkPermissions,
    logSecurityEvent,
    checkRateLimit,
    performSecurityCheck
  };
};