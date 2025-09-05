import { useEffect, useCallback } from 'react';
import { securityMonitoring } from '@/utils/security';
import { useAuth } from '@/hooks/useAuth';

export const useSecurityMonitoring = () => {
  const { user } = useAuth();

  // Initialize security monitoring on mount
  useEffect(() => {
    console.log('🔐 SECURITY: Initializing security monitoring');
    
    // Start DOM manipulation detection
    const stopDOMMonitoring = securityMonitoring.detectDOMManipulation();
    
    // Start console injection monitoring
    securityMonitoring.checkForConsoleInjection();
    
    // Check security headers
    securityMonitoring.monitorSecurityHeaders();
    
    // Cleanup function
    return () => {
      if (stopDOMMonitoring) {
        stopDOMMonitoring();
      }
    };
  }, []);

  // Log security event with user context
  const logSecurityEvent = useCallback((
    type: string,
    details?: Record<string, unknown>
  ) => {
    securityMonitoring.logSuspiciousActivity({
      type,
      userId: user?.uid,
      details: {
        ...details,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    });
  }, [user?.uid]);

  // Check for suspicious conversion patterns
  const checkConversionSecurity = useCallback((
    amount: number,
    affiliateId: string,
    campaignId: string
  ) => {
    // Check for unusually high amounts
    if (amount > 10000) {
      logSecurityEvent('suspicious_conversion', {
        amount,
        affiliateId,
        campaignId,
        reason: 'Unusually high conversion amount'
      });
      return false;
    }

    // Check for rapid consecutive conversions (basic check)
    const recentConversions = localStorage.getItem('recent_conversions');
    if (recentConversions) {
      try {
        const conversions = JSON.parse(recentConversions);
        const recentCount = conversions.filter((conv: any) => 
          Date.now() - new Date(conv.timestamp).getTime() < 60000 // Last minute
        ).length;

        if (recentCount > 5) {
          logSecurityEvent('suspicious_conversion', {
            amount,
            affiliateId,
            campaignId,
            reason: 'Too many conversions in short time',
            recentCount
          });
          return false;
        }
      } catch (error) {
        console.error('Error checking recent conversions:', error);
      }
    }

    return true;
  }, [logSecurityEvent]);

  // Monitor for unauthorized API calls
  const monitorAPICall = useCallback((
    endpoint: string,
    method: string = 'GET',
    data?: any
  ) => {
    // Log API calls for monitoring
    console.log('🔍 API CALL:', { endpoint, method, timestamp: new Date().toISOString() });
    
    // Check for suspicious patterns in API calls
    const suspiciousEndpoints = [
      '/admin/',
      '/users/',
      '/_internal',
      '/debug'
    ];

    if (suspiciousEndpoints.some(suspicious => endpoint.includes(suspicious))) {
      logSecurityEvent('unauthorized_api_access', {
        endpoint,
        method,
        data: data ? JSON.stringify(data).substring(0, 500) : undefined
      });
    }
  }, [logSecurityEvent]);

  // Rate limiting check
  const checkRateLimit = useCallback((action: string, limit: number = 10) => {
    const key = `rate_limit_${action}`;
    const now = Date.now();
    const window = 60000; // 1 minute window
    
    try {
      const stored = localStorage.getItem(key);
      let attempts = stored ? JSON.parse(stored) : [];
      
      // Remove old attempts outside the window
      attempts = attempts.filter((timestamp: number) => now - timestamp < window);
      
      if (attempts.length >= limit) {
        logSecurityEvent('rate_limit_exceeded', {
          action,
          attempts: attempts.length,
          limit,
          window: window / 1000 // Convert to seconds
        });
        return false;
      }
      
      // Add current attempt
      attempts.push(now);
      localStorage.setItem(key, JSON.stringify(attempts));
      
      return true;
    } catch (error) {
      console.error('Error checking rate limit:', error);
      return true; // Allow on error to avoid blocking legitimate users
    }
  }, [logSecurityEvent]);

  return {
    logSecurityEvent,
    checkConversionSecurity,
    monitorAPICall,
    checkRateLimit
  };
};