/**
 * 🛡️ Utilitaires de Sécurité - Protection contre les vulnérabilités communes
 */

import CryptoJS from 'crypto-js';

// Clé de chiffrement (à stocker de façon sécurisée en production)
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'default-key-change-in-production';

/**
 * Protection XSS - Nettoyage et échappement
 */
export const securityUtils = {
  // Échapper les caractères HTML dangereux
  escapeHTML: (str: string): string => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  // Nettoyer les entrées utilisateur
  sanitizeInput: (input: string): string => {
    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Supprimer scripts
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Supprimer iframes
      .replace(/javascript:/gi, '') // Supprimer javascript:
      .replace(/on\w+\s*=/gi, ''); // Supprimer événements inline
  },

  // Créer un script de façon sécurisée
  createSecureScript: (content: string, nonce?: string): HTMLScriptElement => {
    const script = document.createElement('script');
    script.textContent = content; // Plus sûr que innerHTML
    if (nonce) script.nonce = nonce;
    return script;
  },

  // Valider une URL
  isValidURL: (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  },

  // Valider un email
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }
};

/**
 * Stockage sécurisé avec chiffrement
 */
export const secureStorage = {
  // Chiffrer et stocker
  setSecure: (key: string, data: unknown): void => {
    try {
      const jsonString = JSON.stringify(data);
      const encrypted = CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString();
      localStorage.setItem(`secure_${key}`, encrypted);
    } catch (error) {
      console.error('❌ SECURITY - Failed to encrypt data:', error);
    }
  },

  // Récupérer et déchiffrer
  getSecure: <T = unknown>(key: string): T | null => {
    try {
      const encrypted = localStorage.getItem(`secure_${key}`);
      if (!encrypted) return null;
      
      const decrypted = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
      const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
      
      if (!jsonString) return null;
      return JSON.parse(jsonString) as T;
    } catch (error) {
      console.error('❌ SECURITY - Failed to decrypt data:', error);
      return null;
    }
  },

  // Supprimer de façon sécurisée
  removeSecure: (key: string): void => {
    localStorage.removeItem(`secure_${key}`);
  },

  // Nettoyer tout le stockage sécurisé
  clearSecure: (): void => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('secure_')) {
        localStorage.removeItem(key);
      }
    });
  }
};

/**
 * Validation des permissions et autorisations
 */
export const authSecurity = {
  // Vérifier la propriété d'une ressource
  validateOwnership: (resourceUserId: string, currentUserId: string): boolean => {
    if (!resourceUserId || !currentUserId) {
      console.warn('⚠️ SECURITY - Missing user IDs for ownership validation');
      return false;
    }
    
    const isOwner = resourceUserId === currentUserId;
    if (!isOwner) {
      console.warn('⚠️ SECURITY - Ownership validation failed', {
        resource: resourceUserId.substring(0, 8) + '...',
        current: currentUserId.substring(0, 8) + '...'
      });
    }
    
    return isOwner;
  },

  // Valider les permissions d'admin
  validateAdminPermission: (userEmail: string): boolean => {
    const adminEmails = ['admin@refspring.com']; // À configurer
    return adminEmails.includes(userEmail);
  },

  // Générer un token sécurisé
  generateSecureToken: (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
};

/**
 * Protection contre les attaques par timing
 */
export const timingSecurity = {
  // Délai constant pour éviter les attaques par timing
  constantTimeCompare: async (a: string, b: string): Promise<boolean> => {
    // Ajouter un délai aléatoire pour masquer le timing
    await new Promise(resolve => setTimeout(resolve, Math.random() * 50 + 50));
    
    if (a.length !== b.length) return false;
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    
    return result === 0;
  }
};

/**
 * Détection d'anomalies et monitoring
 */
export const securityMonitoring = {
  // Suivre les tentatives d'accès suspect
  logSuspiciousActivity: (activity: {
    type: string;
    userId?: string;
    ip?: string;
    userAgent?: string;
    details?: Record<string, unknown>;
  }): void => {
    try {
      const timestamp = new Date().toISOString();
      const clientIP = activity.ip || 'unknown';
      const userAgent = activity.userAgent || navigator?.userAgent || 'unknown';
      
      const logEntry = {
        timestamp,
        ...activity,
        ip: clientIP,
        userAgent: userAgent,
        sessionId: sessionStorage.getItem('session_id')
      };
      
      console.warn('🚨 SUSPICIOUS ACTIVITY:', logEntry);

      // Store in secure storage for analysis
      secureStorage.setSecure(`suspicious_activity_${timestamp}`, {
        ...logEntry,
        severity: getSeverityLevel(activity.type)
      });

      // Send to security monitoring endpoint in production
      if (import.meta.env.PROD && typeof fetch !== 'undefined') {
        fetch('https://wsvhmozduyiftmuuynpi.supabase.co/functions/v1/security-monitor', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event: {
              ...logEntry,
              severity: getSeverityLevel(activity.type)
            }
          })
        }).catch(error => {
          console.error('Failed to send security event:', error);
        });
      }

    } catch (error) {
      console.error('Error logging suspicious activity:', error);
    }
  },

  // Détecter les tentatives de manipulation DOM
  detectDOMManipulation: (): (() => void) => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              
              // Check for script injections
              if (element.tagName === 'SCRIPT') {
                securityMonitoring.logSuspiciousActivity({
                  type: 'script_injection',
                  details: {
                    scriptContent: element.textContent,
                    scriptSrc: element.getAttribute('src'),
                    parentElement: element.parentElement?.tagName
                  }
                });
                
                // Remove suspicious scripts
                element.remove();
              }
              
              // Check for iframe injections
              if (element.tagName === 'IFRAME') {
                const src = element.getAttribute('src');
                if (src && !src.startsWith(window.location.origin)) {
                  securityMonitoring.logSuspiciousActivity({
                    type: 'iframe_injection',
                    details: {
                      iframeSrc: src,
                      parentElement: element.parentElement?.tagName
                    }
                  });
                  
                  // Remove suspicious iframes
                  element.remove();
                }
              }
            }
          });
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  },

  checkForConsoleInjection: (): void => {
    if (typeof window === 'undefined') return;

    // Detect console-based attacks
    const originalConsole = {
      log: console.log.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
      info: console.info.bind(console)
    };
    
    (['log', 'warn', 'error', 'info'] as const).forEach(method => {
      console[method] = (...args: any[]) => {
        // Check for suspicious console activity
        const message = args.join(' ');
        const suspiciousPatterns = [
          /trackConversion\s*\(/i,
          /window\.RefSpring/i,
          /localStorage\.setItem.*secure_/i,
          /document\.cookie\s*=/i
        ];

        if (suspiciousPatterns.some(pattern => pattern.test(message))) {
          securityMonitoring.logSuspiciousActivity({
            type: 'console_injection_attempt',
            details: {
              method,
              message: message.substring(0, 500), // Limit message length
              stackTrace: new Error().stack
            }
          });
        }

        // Call original console method
        originalConsole[method](...args);
      };
    });
  },

  monitorSecurityHeaders: (): void => {
    if (typeof window === 'undefined') return;

    // Check for security headers on page load
    fetch(window.location.href, { method: 'HEAD' })
      .then(response => {
        const securityHeaders = {
          'content-security-policy': response.headers.get('content-security-policy'),
          'x-frame-options': response.headers.get('x-frame-options'),
          'x-content-type-options': response.headers.get('x-content-type-options'),
          'referrer-policy': response.headers.get('referrer-policy')
        };

        const missingHeaders = Object.entries(securityHeaders)
          .filter(([, value]) => !value)
          .map(([header]) => header);

        if (missingHeaders.length > 0) {
          securityMonitoring.logSuspiciousActivity({
            type: 'missing_security_headers',
            details: {
              missingHeaders,
              currentHeaders: securityHeaders
            }
          });
        }
      })
      .catch(error => {
        console.error('Error checking security headers:', error);
      });
  }
};

function getSeverityLevel(activityType: string): 'low' | 'medium' | 'high' | 'critical' {
  const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
    'script_injection': 'critical',
    'iframe_injection': 'critical',
    'console_injection_attempt': 'high',
    'data_breach_attempt': 'critical',
    'unauthorized_access': 'high',
    'suspicious_conversion': 'medium',
    'rate_limit_exceeded': 'medium',
    'missing_security_headers': 'low',
    'dom_manipulation': 'medium'
  };

  return severityMap[activityType] || 'low';
}

/**
 * Validation des données côté client (à compléter par validation serveur)
 */
export const dataValidation = {
  // Valider les données de campagne
  validateCampaignData: (data: {
    name?: string;
    description?: string;
    targetUrl?: string;
    commissionRate?: number;
  }): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!data.name || data.name.length < 3 || data.name.length > 100) {
      errors.push('Le nom doit contenir entre 3 et 100 caractères');
    }
    
    if (data.description && data.description.length > 500) {
      errors.push('La description ne peut pas dépasser 500 caractères');
    }
    
    if (data.targetUrl && !securityUtils.isValidURL(data.targetUrl)) {
      errors.push('L\'URL cible n\'est pas valide');
    }
    
    if (data.commissionRate !== undefined) {
      if (data.commissionRate < 0 || data.commissionRate > 100) {
        errors.push('Le taux de commission doit être entre 0 et 100%');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Valider les données d'affilié
  validateAffiliateData: (data: {
    name?: string;
    email?: string;
    commissionRate?: number;
  }): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!data.name || data.name.length < 2 || data.name.length > 50) {
      errors.push('Le nom doit contenir entre 2 et 50 caractères');
    }
    
    if (!data.email || !securityUtils.isValidEmail(data.email)) {
      errors.push('Adresse email invalide');
    }
    
    if (data.commissionRate !== undefined) {
      if (data.commissionRate < 0 || data.commissionRate > 100) {
        errors.push('Le taux de commission doit être entre 0 et 100%');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

// Initialiser le monitoring de sécurité
if (typeof window !== 'undefined') {
  securityMonitoring.detectDOMManipulation();
}