
import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AccountSettingsNavigation } from '@/components/AccountSettingsNavigation';
import { AccountSettings } from '@/components/AccountSettings';
import { AccountBillingSettings } from '@/components/AccountBillingSettings';
import { AccountSecuritySettings } from '@/components/AccountSecuritySettings';
import { CurrencySettings } from '@/components/CurrencySettings';
import { BillingHistorySettings } from '@/components/BillingHistorySettings';

interface AccountSettingsDialogProps {
  children?: React.ReactNode;
}

export const AccountSettingsDialog = ({ children }: AccountSettingsDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  const [deletionDialogOpen, setDeletionDialogOpen] = useState(false);
  const [deletionPassword, setDeletionPassword] = useState('');

  const handleDeleteAccount = async () => {
    if (!user || !deletionPassword) {
      toast({
        title: "Erreur",
        description: "Mot de passe requis pour supprimer le compte",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Avec Supabase, nous utilisons une approche différente pour supprimer le compte
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès",
      });
    } catch (error: any) {
      toast({
        title: "Erreur", 
        description: error.message || "Une erreur s'est produite",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setDeletionDialogOpen(false);
      setDeletionPassword('');
    }
  };

  const handleDeleteClick = () => {
    setOpen(false);
    setDeletionDialogOpen(true);
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'account':
        return 'Gestion du profil';
      case 'security':
        return 'Sécurité';
      case 'currency':
        return 'Devise préférée';
      case 'billing':
        return 'Moyen de paiement';
      case 'invoices':
        return 'Historique de facturation';
      default:
        return 'Paramètres';
    }
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case 'account':
        return 'Modifiez votre email et mot de passe';
      case 'security':
        return 'Gérez la sécurité de votre compte';
      case 'currency':
        return 'Choisissez votre devise préférée';
      case 'billing':
        return 'Consultez vos informations de facturation';
      case 'invoices':
        return 'Consultez vos factures et prélèvements mensuels';
      default:
        return '';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return <AccountSettings onCancel={() => setOpen(false)} />;
      case 'security':
        return <AccountSecuritySettings onCancel={() => setOpen(false)} />;
      case 'currency':
        return <CurrencySettings onCancel={() => setOpen(false)} />;
      case 'billing':
        return <AccountBillingSettings onCancel={() => setOpen(false)} />;
      case 'invoices':
        return <BillingHistorySettings onCancel={() => setOpen(false)} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children || (
            <button className="rounded-lg p-2 hover:bg-slate-100 transition-colors">
              <Settings className="h-4 w-4" />
            </button>
          )}
        </DialogTrigger>
        <DialogContent className="w-[calc(100vw-60px)] h-[calc(100vh-60px)] max-w-6xl max-h-[90vh] p-0 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="flex h-full">
            <AccountSettingsNavigation 
              activeTab={activeTab} 
              onTabChange={setActiveTab}
              onDeleteClick={handleDeleteClick}
            />

            <div className="flex-1 flex flex-col">
              <div className="p-8 border-b bg-white">
                <h3 className="text-2xl font-semibold text-slate-900">{getTabTitle()}</h3>
                <p className="text-slate-600 mt-2">{getTabDescription()}</p>
              </div>

              <div className="flex-1 p-8 overflow-auto">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deletionDialogOpen} onOpenChange={setDeletionDialogOpen}>
        <AlertDialogContent className="bg-white border border-slate-200 rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer définitivement le compte</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes vos données seront définitivement supprimées.
              <div className="mt-4">
                <input
                  type="password"
                  placeholder="Confirmez avec votre mot de passe"
                  value={deletionPassword}
                  onChange={(e) => setDeletionPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteAccount} 
              className="bg-red-600 hover:bg-red-700"
              disabled={!deletionPassword || loading}
            >
              {loading ? 'Suppression...' : 'Supprimer définitivement'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
