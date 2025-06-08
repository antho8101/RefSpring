
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldX, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AuthRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action?: string;
}

export const AuthRequiredDialog = ({ 
  open, 
  onOpenChange, 
  action = 'cette action' 
}: AuthRequiredDialogProps) => {
  const navigate = useNavigate();

  const handleGoToAuth = () => {
    console.log('🔐 SECURITY - Redirecting to auth from AuthRequiredDialog');
    // Sauvegarder l'action tentée pour après connexion
    sessionStorage.setItem('pendingAction', action);
    navigate('/auth');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <ShieldX className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle>Authentification requise</DialogTitle>
              <DialogDescription>
                Vous devez être connecté pour {action}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-4">
          <Button onClick={handleGoToAuth} className="w-full">
            <LogIn className="mr-2 h-4 w-4" />
            Se connecter
          </Button>
          
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full">
            Annuler
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
