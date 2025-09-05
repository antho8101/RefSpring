/**
 * 🔒 Enhanced Content Security Policy Implementation
 * Advanced CSP with nonce generation and dynamic updates
 */

let currentNonce: string | null = null;

// Generate a cryptographically secure nonce
export const generateNonce = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const nonce = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  currentNonce = nonce;
  return nonce;
};

// Generate comprehensive CSP with security best practices
export const generateSecureCSP = (): string => {
  const nonce = generateNonce();
  
  // Store nonce globally for use in scripts
  if (typeof window !== 'undefined') {
    (window as any).__CSP_NONCE__ = nonce;
  }

  // Enhanced CSP with strict security policies
  const cspDirectives = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      `'nonce-${nonce}'`,
      'https://js.stripe.com',
      'https://va.vercel-scripts.com',
      'https://vitals.vercel-analytics.com',
      'https://wsvhmozduyiftmuuynpi.supabase.co'
    ],
    'style-src': [
      "'self'", 
      "'unsafe-inline'", // Required for Tailwind CSS
      'https://fonts.googleapis.com'
    ],
    'font-src': [
      "'self'", 
      'https://fonts.gstatic.com', 
      'data:'
    ],
    'img-src': [
      "'self'", 
      'data:', 
      'blob:', 
      'https:', 
      'https://images.unsplash.com',
      'https://cdn.shopify.com',
      'https://wsvhmozduyiftmuuynpi.supabase.co'
    ],
    'connect-src': [
      "'self'",
      'https://wsvhmozduyiftmuuynpi.supabase.co',
      'https://api.stripe.com',
      'https://*.shopify.com',
      'https://*.firebase.googleapis.com',
      'wss://wsvhmozduyiftmuuynpi.supabase.co'
    ],
    'frame-src': [
      "'self'", 
      'https://js.stripe.com',
      'https://hooks.stripe.com',
      'https://*.shopify.com'
    ],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': []
  };

  // Convert directives to CSP string
  const cspString = Object.entries(cspDirectives)
    .map(([directive, sources]) => {
      if (sources.length === 0) return directive;
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ') + ';';

  return cspString;
};

// Apply enhanced CSP and other security headers
export const applyEnhancedCSP = (): void => {
  if (typeof document === 'undefined') return;

  try {
    const csp = generateSecureCSP();
    
    // Remove existing CSP meta tag if present
    const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (existingCSP) {
      existingCSP.remove();
    }

    // Add enhanced CSP
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = csp;
    document.head.appendChild(cspMeta);

    console.log('🔒 ENHANCED CSP: Security headers applied successfully');
    
  } catch (error) {
    console.error('🔒 ENHANCED CSP ERROR: Failed to apply security headers:', error);
  }
};

// Initialize enhanced CSP system
export const initEnhancedCSP = (): void => {
  if (typeof window !== 'undefined') {
    applyEnhancedCSP();
  }
};