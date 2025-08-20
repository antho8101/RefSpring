import { useEffect, useRef, ReactNode } from 'react';
import { useAccessibility } from '@/hooks/useAccessibility';

interface FocusTrapProps {
  children: ReactNode;
  active: boolean;
  onEscape?: () => void;
  autoFocus?: boolean;
  restoreFocus?: boolean;
}

export const FocusTrap = ({ 
  children, 
  active, 
  onEscape,
  autoFocus = true,
  restoreFocus = true 
}: FocusTrapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { trapFocus, releaseFocus, handleKeyboardNavigation } = useAccessibility();
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    // Store the previously focused element
    if (restoreFocus) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }

    // Setup focus trap
    if (autoFocus) {
      trapFocus(containerRef.current);
    }

    // Keyboard event handler
    const handleKeyDown = (event: KeyboardEvent) => {
      handleKeyboardNavigation(event, onEscape);
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      
      // Release focus trap and restore focus
      if (active) {
        releaseFocus();
        
        if (restoreFocus && previousFocusRef.current) {
          // Small delay to ensure cleanup is complete
          setTimeout(() => {
            previousFocusRef.current?.focus();
          }, 0);
        }
      }
    };
  }, [active, autoFocus, restoreFocus, trapFocus, releaseFocus, handleKeyboardNavigation, onEscape]);

  if (!active) {
    return <>{children}</>;
  }

  return (
    <div ref={containerRef} className="focus-trap">
      {children}
    </div>
  );
};