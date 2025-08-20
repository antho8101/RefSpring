/**
 * Constantes de l'application
 */

// URLs et domaines
export const DOMAIN = {
  PRODUCTION: 'https://refspring.com',
  DEVELOPMENT: 'http://localhost:5173'
} as const;

// Routes internes
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  CAMPAIGNS: '/campaigns',
  AFFILIATES: '/affiliates',
  SETTINGS: '/settings',
  PRICING: '/pricing',
  ABOUT: '/about',
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  SECURITY: '/security',
  STATUS: '/status'
} as const;

// Messages d'erreur standardisés
export const ERROR_MESSAGES = {
  NETWORK: 'Erreur de connexion. Veuillez réessayer.',
  UNAUTHORIZED: 'Accès non autorisé. Veuillez vous connecter.',
  FORBIDDEN: 'Vous n\'avez pas les permissions nécessaires.',
  NOT_FOUND: 'Ressource non trouvée.',
  VALIDATION: 'Données invalides. Veuillez vérifier vos informations.',
  SERVER: 'Erreur serveur. Veuillez réessayer plus tard.',
  TIMEOUT: 'Délai d\'attente dépassé. Veuillez réessayer.'
} as const;

// Messages de succès
export const SUCCESS_MESSAGES = {
  CAMPAIGN_CREATED: 'Campagne créée avec succès !',
  CAMPAIGN_UPDATED: 'Campagne mise à jour avec succès !',
  CAMPAIGN_DELETED: 'Campagne supprimée avec succès !',
  AFFILIATE_CREATED: 'Affilié créé avec succès !',
  AFFILIATE_UPDATED: 'Affilié mis à jour avec succès !',
  AFFILIATE_DELETED: 'Affilié supprimé avec succès !',
  SETTINGS_SAVED: 'Paramètres sauvegardés avec succès !',
  EMAIL_SENT: 'Email envoyé avec succès !',
  COPIED_TO_CLIPBOARD: 'Copié dans le presse-papier !'
} as const;

// Configuration des animations
export const ANIMATION = {
  DURATION: {
    FAST: 150,
    MEDIUM: 300,
    SLOW: 500
  },
  EASING: {
    EASE_IN: 'ease-in',
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out'
  }
} as const;

// Limits et seuils
export const LIMITS = {
  CAMPAIGNS_PER_USER: 50,
  AFFILIATES_PER_CAMPAIGN: 1000,
  FILE_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB
  PAGE_SIZE: 20,
  DEBOUNCE_DELAY: 300,
  RETRY_ATTEMPTS: 3
} as const;

// Configuration Stripe
export const STRIPE = {
  PLATFORM_FEE_RATE: 0.025, // 2.5%
  CURRENCY: 'EUR',
  MIN_AMOUNT: 1, // 1€
  MAX_AMOUNT: 999999 // 999,999€
} as const;

// Statuts des entités
export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended'
} as const;

// Types de notifications
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
} as const;

// Régions supportées
export const SUPPORTED_REGIONS = {
  FR: 'France',
  BE: 'Belgique',
  CH: 'Suisse',
  CA: 'Canada'
} as const;

// Devises supportées
export const SUPPORTED_CURRENCIES = {
  EUR: 'Euro',
  USD: 'Dollar US',
  CAD: 'Dollar Canadien',
  CHF: 'Franc Suisse'
} as const;

// Langues supportées
export const SUPPORTED_LANGUAGES = {
  FR: 'Français',
  EN: 'English'
} as const;