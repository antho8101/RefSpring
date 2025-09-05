/**
 * 🛡️ ENHANCED SECURITY MONITORING
 * Real-time security event detection and alerting
 */

interface SecurityAlert {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  type: string;
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

class SecurityMonitor {
  private alerts: SecurityAlert[] = [];
  private listeners: Array<(alert: SecurityAlert) => void> = [];
  
  constructor() {
    this.initializeMonitoring();
  }

  private initializeMonitoring() {
    // Monitor for suspicious script injections
    this.setupDOMObserver();
    
    // Monitor network requests for suspicious patterns
    this.setupNetworkMonitoring();
    
    // Monitor for console tampering attempts
    this.setupConsoleMonitoring();
    
    // Monitor for token theft attempts
    this.setupStorageMonitoring();
  }

  private setupDOMObserver() {
    if (typeof document === 'undefined') return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // Check for suspicious script injections
            if (element.tagName === 'SCRIPT') {
              const src = element.getAttribute('src');
              const content = element.textContent || '';
              
              if (this.isSuspiciousScript(src, content)) {
                this.createAlert('HIGH', 'script_injection', 
                  'Suspicious script injection detected', {
                  src, content: content.substring(0, 100)
                });
              }
            }
            
            // Check for iframe injections
            if (element.tagName === 'IFRAME') {
              const src = element.getAttribute('src');
              if (src && !this.isAllowedFrame(src)) {
                this.createAlert('HIGH', 'iframe_injection', 
                  'Unauthorized iframe detected', { src });
              }
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private setupNetworkMonitoring() {
    // Surveillance réseau désactivée car elle interfère avec Supabase dans Lovable
    // const originalFetch = window.fetch;
    // 
    // window.fetch = async (...args) => {
    //   const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
    //   
    //   if (this.isSuspiciousRequest(url)) {
    //     this.createAlert('MEDIUM', 'suspicious_request', 
    //       'Suspicious network request detected', { url });
    //   }
    //   
    //   return originalFetch.apply(window, args);
    // };
    console.log('🔒 SECURITY: Network monitoring désactivé pour éviter les conflits avec Supabase');
  }

  private setupConsoleMonitoring() {
    const originalConsole = { ...console };
    
    // Monitor for console injection attempts
    Object.keys(originalConsole).forEach((method) => {
      const original = originalConsole[method as keyof typeof console];
      (console as any)[method] = (...args: any[]) => {
        const message = args.join(' ');
        
        if (this.isSuspiciousConsoleActivity(message)) {
          this.createAlert('MEDIUM', 'console_injection', 
            'Suspicious console activity detected', { message });
        }
        
        return original.apply(console, args);
      };
    });
  }

  private setupStorageMonitoring() {
    const originalSetItem = localStorage.setItem;
    
    localStorage.setItem = (key: string, value: string) => {
      if (this.isSensitiveData(key, value)) {
        this.createAlert('HIGH', 'sensitive_storage', 
          'Attempt to store sensitive data detected', { key });
        return;
      }
      
      return originalSetItem.call(localStorage, key, value);
    };
  }

  private isSuspiciousScript(src: string | null, content: string): boolean {
    const suspiciousPatterns = [
      /eval\s*\(/,
      /Function\s*\(/,
      /document\.write/,
      /innerHTML\s*=/,
      /crypto.*private/i,
      /token.*steal/i
    ];
    
    return suspiciousPatterns.some(pattern => 
      (src && pattern.test(src)) || pattern.test(content)
    );
  }

  private isAllowedFrame(src: string): boolean {
    const allowedDomains = [
      'js.stripe.com',
      'hooks.stripe.com',
      'shopify.com',
      'supabase.co'
    ];
    
    return allowedDomains.some(domain => src.includes(domain));
  }

  private isSuspiciousRequest(url: string): boolean {
    const suspiciousPatterns = [
      /malware/i,
      /phishing/i,
      /suspicious-domain\.com/,
      /steal.*token/i
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(url));
  }

  private isSuspiciousConsoleActivity(message: string): boolean {
    const suspiciousPatterns = [
      /password/i,
      /token/i,
      /secret/i,
      /crypto.*key/i
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(message));
  }

  private isSensitiveData(key: string, value: string): boolean {
    const sensitiveKeys = [
      'password', 'token', 'secret', 'key', 'auth',
      'stripe', 'shopify', 'firebase'
    ];
    
    return sensitiveKeys.some(sensitive => 
      key.toLowerCase().includes(sensitive) || 
      value.toLowerCase().includes(sensitive)
    );
  }

  private createAlert(level: SecurityAlert['level'], type: string, 
                      message: string, metadata?: Record<string, any>) {
    const alert: SecurityAlert = {
      level,
      type,
      message,
      timestamp: new Date(),
      metadata
    };
    
    this.alerts.push(alert);
    
    // Notify listeners
    this.listeners.forEach(listener => listener(alert));
    
    // Log critical alerts
    if (level === 'CRITICAL' || level === 'HIGH') {
      console.warn('🚨 SECURITY ALERT:', alert);
    }
  }

  public onAlert(listener: (alert: SecurityAlert) => void) {
    this.listeners.push(listener);
    
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public getAlerts(): SecurityAlert[] {
    return [...this.alerts];
  }

  public clearAlerts() {
    this.alerts = [];
  }
}

export const securityMonitor = new SecurityMonitor();
export type { SecurityAlert };