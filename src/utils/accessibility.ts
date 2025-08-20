/**
 * 🌟 Utilitaires d'Accessibilité - Support WCAG 2.1 AA
 */

import { useEffect, useCallback, useRef } from 'react';

/**
 * Hook pour la navigation clavier globale
 */
export const useKeyboardNavigation = () => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Échapper pour fermer les modales
    if (event.key === 'Escape') {
      const modals = document.querySelectorAll('[role="dialog"]');
      modals.forEach(modal => {
        const closeButton = modal.querySelector('[aria-label*="fermer"], [aria-label*="close"]');
        if (closeButton) (closeButton as HTMLElement).click();
      });
    }

    // Ctrl+K pour palette de commandes
    if (event.ctrlKey && event.key === 'k') {
      event.preventDefault();
      // TODO: Implémenter palette de commandes
      console.log('🎯 A11Y - Command palette requested');
    }

    // Ctrl+/ pour raccourcis clavier
    if (event.ctrlKey && event.key === '/') {
      event.preventDefault();
      showKeyboardShortcuts();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

/**
 * Afficher les raccourcis clavier disponibles
 */
const showKeyboardShortcuts = () => {
  const shortcuts = [
    { key: 'Tab', description: 'Navigation suivant' },
    { key: 'Shift + Tab', description: 'Navigation précédent' },
    { key: 'Espace/Entrée', description: 'Activer élément' },
    { key: 'Échap', description: 'Fermer modal/menu' },
    { key: 'Ctrl + K', description: 'Palette de commandes' },
    { key: 'Ctrl + /', description: 'Afficher raccourcis' }
  ];

  console.table(shortcuts);
  // TODO: Afficher dans une modale accessible
};

/**
 * Hook pour focus trap dans les modales
 */
export const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKeyPress = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          event.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          event.preventDefault();
        }
      }
    };

    // Focus initial
    firstElement?.focus();

    container.addEventListener('keydown', handleTabKeyPress);
    return () => container.removeEventListener('keydown', handleTabKeyPress);
  }, [isActive]);

  return containerRef;
};

/**
 * Hook pour annoncer les changements aux lecteurs d'écran
 */
export const useScreenReaderAnnouncer = () => {
  const announcerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!announcerRef.current) {
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      announcer.style.cssText = `
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      `;
      document.body.appendChild(announcer);
      announcerRef.current = announcer;
    }

    return () => {
      if (announcerRef.current) {
        document.body.removeChild(announcerRef.current);
      }
    };
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announcerRef.current) {
      announcerRef.current.setAttribute('aria-live', priority);
      announcerRef.current.textContent = message;
      
      // Nettoyer après annonce
      setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = '';
        }
      }, 1000);
    }
  }, []);

  return announce;
};

/**
 * Validation de contraste couleur (WCAG 2.1)
 */
export const checkColorContrast = (foreground: string, background: string): {
  ratio: number;
  wcagAA: boolean;
  wcagAAA: boolean;
} => {
  // Convertir couleurs en luminance
  const getLuminance = (color: string): number => {
    // Simplification - en production, utiliser une librairie comme chroma.js
    const rgb = color.match(/\d+/g);
    if (!rgb) return 0;
    
    const [r, g, b] = rgb.map(x => {
      const val = parseInt(x) / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const lum1 = getLuminance(foreground);
  const lum2 = getLuminance(background);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  const ratio = (brightest + 0.05) / (darkest + 0.05);

  return {
    ratio: Math.round(ratio * 100) / 100,
    wcagAA: ratio >= 4.5,      // WCAG AA minimum
    wcagAAA: ratio >= 7.0      // WCAG AAA recommandé
  };
};

/**
 * Détection des préférences utilisateur
 */
export const useAccessibilityPreferences = () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

  return {
    reducedMotion: prefersReducedMotion,
    highContrast: prefersHighContrast,
    darkMode: prefersDarkMode
  };
};

/**
 * Composant Skip Link pour navigation rapide
 */
export const createSkipLink = (href: string, children: string) => {
  const link = document.createElement('a');
  link.href = href;
  link.className = "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg";
  link.textContent = children;
  link.onclick = (e) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      (target as HTMLElement).focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };
  return link;
};

/**
 * Utilitaires ARIA
 */
export const ariaUtils = {
  // Générer un ID unique pour aria-describedby
  generateId: (prefix: string = 'aria'): string => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Créer des attributs ARIA pour un élément
  createAriaAttributes: (options: {
    label?: string;
    description?: string;
    expanded?: boolean;
    controls?: string;
    required?: boolean;
    invalid?: boolean;
  }) => {
    const attrs: Record<string, string | boolean> = {};
    
    if (options.label) attrs['aria-label'] = options.label;
    if (options.description) attrs['aria-describedby'] = options.description;
    if (options.expanded !== undefined) attrs['aria-expanded'] = options.expanded;
    if (options.controls) attrs['aria-controls'] = options.controls;
    if (options.required) attrs['aria-required'] = true;
    if (options.invalid) attrs['aria-invalid'] = true;
    
    return attrs;
  },

  // Annoncer une action aux lecteurs d'écran
  announceAction: (action: string, element?: string) => {
    const message = element ? `${action} ${element}` : action;
    console.log(`🔊 A11Y - Announced: ${message}`);
    // En production, utiliser useScreenReaderAnnouncer
  }
};

/**
 * Tests d'accessibilité automatisés
 */
export const accessibilityTests = {
  // Vérifier que tous les boutons ont des labels
  checkButtonLabels: (): string[] => {
    const issues: string[] = [];
    const buttons = document.querySelectorAll('button');
    
    buttons.forEach((button, index) => {
      const hasLabel = button.textContent?.trim() || 
                      button.getAttribute('aria-label') || 
                      button.getAttribute('title');
      
      if (!hasLabel) {
        issues.push(`Button ${index + 1} missing accessible label`);
      }
    });
    
    return issues;
  },

  // Vérifier que toutes les images ont des alt
  checkImageAlts: (): string[] => {
    const issues: string[] = [];
    const images = document.querySelectorAll('img');
    
    images.forEach((img, index) => {
      const alt = img.getAttribute('alt');
      if (alt === null) {
        issues.push(`Image ${index + 1} missing alt attribute`);
      }
    });
    
    return issues;
  },

  // Vérifier la hiérarchie des titres
  checkHeadingHierarchy: (): string[] => {
    const issues: string[] = [];
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      
      if (index === 0 && level !== 1) {
        issues.push('First heading should be h1');
      }
      
      if (level > previousLevel + 1) {
        issues.push(`Heading level jumps from h${previousLevel} to h${level}`);
      }
      
      previousLevel = level;
    });
    
    return issues;
  },

  // Exécuter tous les tests
  runAllTests: () => {
    const allIssues = [
      ...accessibilityTests.checkButtonLabels(),
      ...accessibilityTests.checkImageAlts(),
      ...accessibilityTests.checkHeadingHierarchy()
    ];
    
    if (allIssues.length === 0) {
      console.log('✅ A11Y - All accessibility tests passed!');
    } else {
      console.warn('⚠️ A11Y - Issues found:', allIssues);
    }
    
    return allIssues;
  }
};