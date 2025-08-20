import { useState, useCallback, useRef, useEffect } from 'react';

interface Announcement {
  id: string;
  message: string;
  priority: 'polite' | 'assertive';
  timestamp: number;
}

interface FocusManagement {
  previousFocus: HTMLElement | null;
  trapStack: HTMLElement[];
}

export const useAccessibility = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const focusManagement = useRef<FocusManagement>({
    previousFocus: null,
    trapStack: []
  });

  // Announce to screen readers
  const announce = useCallback((
    message: string, 
    priority: 'polite' | 'assertive' = 'polite'
  ) => {
    const announcement: Announcement = {
      id: crypto.randomUUID(),
      message,
      priority,
      timestamp: Date.now()
    };

    setAnnouncements(prev => {
      // Keep only last 5 announcements to avoid memory leaks
      const newAnnouncements = [...prev, announcement].slice(-5);
      return newAnnouncements;
    });

    // Auto-clear announcement after 5 seconds
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a.id !== announcement.id));
    }, 5000);
  }, []);

  // Focus management for modals and overlays
  const trapFocus = useCallback((element: HTMLElement) => {
    // Store previous focus
    focusManagement.current.previousFocus = document.activeElement as HTMLElement;
    
    // Add to trap stack
    focusManagement.current.trapStack.push(element);

    // Focus first focusable element
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }
  }, []);

  const releaseFocus = useCallback(() => {
    // Remove from trap stack
    focusManagement.current.trapStack.pop();

    // Restore previous focus if no more traps
    if (focusManagement.current.trapStack.length === 0 && focusManagement.current.previousFocus) {
      focusManagement.current.previousFocus.focus();
      focusManagement.current.previousFocus = null;
    }
  }, []);

  // Keyboard navigation helpers
  const handleKeyboardNavigation = useCallback((
    event: KeyboardEvent,
    onEscape?: () => void,
    onEnter?: () => void
  ) => {
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        onEscape?.();
        break;
      case 'Enter':
        if (onEnter && event.target === event.currentTarget) {
          event.preventDefault();
          onEnter();
        }
        break;
      case 'Tab':
        // Handle focus trap if active
        if (focusManagement.current.trapStack.length > 0) {
          const currentTrap = focusManagement.current.trapStack[
            focusManagement.current.trapStack.length - 1
          ];
          
          const focusableElements = Array.from(currentTrap.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )) as HTMLElement[];

          if (focusableElements.length === 0) return;

          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (event.shiftKey) {
            // Shift + Tab (backward)
            if (document.activeElement === firstElement) {
              event.preventDefault();
              lastElement.focus();
            }
          } else {
            // Tab (forward)
            if (document.activeElement === lastElement) {
              event.preventDefault();
              firstElement.focus();
            }
          }
        }
        break;
    }
  }, []);

  // Check if user prefers reduced motion
  const prefersReducedMotion = useCallback(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Announce page changes
  const announcePageChange = useCallback((pageTitle: string) => {
    announce(`Navigated to ${pageTitle}`, 'polite');
  }, [announce]);

  // Announce dynamic content changes
  const announceContentChange = useCallback((description: string) => {
    announce(`Content updated: ${description}`, 'polite');
  }, [announce]);

  // Announce loading states
  const announceLoading = useCallback((isLoading: boolean, context?: string) => {
    if (isLoading) {
      announce(`Loading${context ? ` ${context}` : ''}...`, 'polite');
    } else {
      announce(`${context || 'Content'} loaded`, 'polite');
    }
  }, [announce]);

  return {
    announcements,
    announce,
    trapFocus,
    releaseFocus,
    handleKeyboardNavigation,
    prefersReducedMotion,
    announcePageChange,
    announceContentChange,
    announceLoading
  };
};
