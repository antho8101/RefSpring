import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { initSecurityHardening } from '@/utils/securityHardening';

interface SecurityContextType {
  logSecurityEvent: (type: string, details?: Record<string, unknown>) => void;
  checkConversionSecurity: (amount: number, affiliateId: string, campaignId: string) => boolean;
  monitorAPICall: (endpoint: string, method?: string, data?: any) => void;
  checkRateLimit: (action: string, limit?: number) => boolean;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

interface SecurityProviderProps {
  children: ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const securityMonitoring = useSecurityMonitoring();

  useEffect(() => {
    // Initialize security hardening on app startup
    console.log('🔐 SECURITY PROVIDER: Initializing comprehensive security');
    
    try {
      initSecurityHardening();
      
      // Additional security monitoring setup
      if (typeof window !== 'undefined') {
        // Make security monitoring available globally for emergency use
        (window as any).__securityMonitoring = securityMonitoring;
        
        // Monitor page visibility changes for security
        document.addEventListener('visibilitychange', () => {
          if (document.hidden) {
            securityMonitoring.logSecurityEvent('page_hidden', {
              timestamp: new Date().toISOString()
            });
          }
        });
        
        // Monitor for suspicious keyboard shortcuts
        document.addEventListener('keydown', (event) => {
          const suspiciousKeys = [
            { key: 'F12' }, // DevTools
            { key: 'I', ctrlKey: true, shiftKey: true }, // DevTools
            { key: 'J', ctrlKey: true, shiftKey: true }, // Console
            { key: 'U', ctrlKey: true }, // View Source
          ];
          
          const isSuspicious = suspiciousKeys.some(combo => {
            return event.key === combo.key && 
                   (!combo.ctrlKey || event.ctrlKey) && 
                   (!combo.shiftKey || event.shiftKey);
          });
          
          if (isSuspicious && process.env.NODE_ENV === 'production') {
            securityMonitoring.logSecurityEvent('suspicious_keyboard_shortcut', {
              key: event.key,
              ctrlKey: event.ctrlKey,
              shiftKey: event.shiftKey,
              altKey: event.altKey
            });
            
            // Optionally prevent the shortcut in production
            event.preventDefault();
          }
        });
        
        // Monitor for clipboard access attempts
        document.addEventListener('copy', () => {
          securityMonitoring.logSecurityEvent('clipboard_copy', {
            selection: window.getSelection()?.toString().substring(0, 100)
          });
        });
        
        document.addEventListener('paste', () => {
          securityMonitoring.logSecurityEvent('clipboard_paste', {
            timestamp: new Date().toISOString()
          });
        });
      }
      
      console.log('✅ SECURITY PROVIDER: All security measures activated');
      
    } catch (error) {
      console.error('❌ SECURITY PROVIDER: Error initializing security:', error);
    }
  }, [securityMonitoring]);

  const contextValue: SecurityContextType = {
    logSecurityEvent: securityMonitoring.logSecurityEvent,
    checkConversionSecurity: securityMonitoring.checkConversionSecurity,
    monitorAPICall: securityMonitoring.monitorAPICall,
    checkRateLimit: securityMonitoring.checkRateLimit,
  };

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = (): SecurityContextType => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

export default SecurityProvider;