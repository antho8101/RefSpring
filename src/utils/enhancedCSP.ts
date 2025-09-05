/**
 * 🛡️ ENHANCED CONTENT SECURITY POLICY
 * Tightened CSP configuration for maximum security
 */

export const generateSecureCSP = (): string => {
  const nonce = generateNonce();
  
  // Store nonce for use in inline scripts
  if (typeof window !== 'undefined') {
    (window as any).__CSP_NONCE__ = nonce;
  }

  const cspDirectives = {
    'default-src': "'self'",
    'script-src': `'self' 'nonce-${nonce}' 
      https://js.stripe.com 
      https://va.vercel-scripts.com
      https://vitals.vercel-analytics.com`,
    'style-src': `'self' 'unsafe-inline' https://fonts.googleapis.com`,
    'font-src': `'self' https://fonts.gstatic.com data:`,
    'img-src': `'self' data: blob: https: 
      https://images.unsplash.com 
      https://cdn.shopify.com
      https://*.supabase.co`,
    'connect-src': `'self' 
      https://*.supabase.co
      https://api.stripe.com
      https://*.shopify.com
      https://*.firebase.googleapis.com
      wss://*.supabase.co`,
    'frame-src': `'self' 
      https://js.stripe.com 
      https://hooks.stripe.com
      https://*.shopify.com`,
    'object-src': "'none'",
    'base-uri': "'self'",
    'form-action': "'self'",
    'frame-ancestors': "'none'",
    'upgrade-insecure-requests': ''
  };

  return Object.entries(cspDirectives)
    .map(([directive, sources]) => `${directive} ${sources.trim()}`)
    .join('; ');
};

function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export const applyEnhancedCSP = (): void => {
  if (typeof document === 'undefined') return;

  // Remove existing CSP meta tag
  const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (existingCSP) {
    existingCSP.remove();
  }

  // Apply new secure CSP
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = generateSecureCSP();
  document.head.appendChild(meta);

  // Add additional security headers via meta tags
  const securityHeaders = [
    { name: 'X-Content-Type-Options', content: 'nosniff' },
    { name: 'X-Frame-Options', content: 'DENY' },
    { name: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' },
    { name: 'Permissions-Policy', content: 'camera=(), microphone=(), geolocation=()' }
  ];

  securityHeaders.forEach(({ name, content }) => {
    const existing = document.querySelector(`meta[http-equiv="${name}"]`);
    if (existing) existing.remove();
    
    const meta = document.createElement('meta');
    meta.httpEquiv = name;
    meta.content = content;
    document.head.appendChild(meta);
  });
};

export const getCSPNonce = (): string | null => {
  return (window as any).__CSP_NONCE__ || null;
};