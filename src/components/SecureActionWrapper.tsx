
import { useState } from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { AuthRequiredDialog } from '@/components/AuthRequiredDialog';

interface SecureActionWrapperProps {
  children: React.ReactNode;
  action: string;
  requireAuth?: boolean;
  onUnauthorized?: () => void;
}

export const SecureActionWrapper = ({ 
  children, 
  action,
  requireAuth = true,
  onUnauthorized
}: SecureActionWrapperProps) => {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { isAuthenticated } = useAuthGuard({ 
    requireAuth: false,
    onUnauthorized: () => {
      if (onUnauthorized) {
        onUnauthorized();
      } else {
        setShowAuthDialog(true);
      }
    }
  });

  const handleAction = (originalHandler: () => void) => {
    return () => {
      console.log(`🔐 SECURITY - Attempting secured action: ${action}`);
      
      if (requireAuth && !isAuthenticated) {
        console.log(`🔐 SECURITY - Blocking unauthorized action: ${action}`);
        setShowAuthDialog(true);
        return;
      }
      
      console.log(`🔐 SECURITY - Authorized action proceeding: ${action}`);
      originalHandler();
    };
  };

  // Wrapper pour ajouter la sécurité aux enfants
  const securedChildren = Array.isArray(children) 
    ? children.map((child, index) => {
        if (child && typeof child === 'object' && 'props' in child) {
          const originalOnClick = child.props.onClick;
          if (originalOnClick) {
            return {
              ...child,
              props: {
                ...child.props,
                onClick: handleAction(originalOnClick),
                key: index
              }
            };
          }
        }
        return child;
      })
    : children;

  return (
    <>
      {securedChildren}
      <AuthRequiredDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        action={action}
      />
    </>
  );
};
