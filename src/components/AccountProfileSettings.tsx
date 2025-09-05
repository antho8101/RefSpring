
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AccountProfileSettingsProps {
  onCancel: () => void;
}

export const AccountProfileSettings = ({ onCancel }: AccountProfileSettingsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');

  const handleUpdateEmail = async () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Utilisateur non connecté",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });
      
      if (error) throw error;
      
      toast({
        title: "Email mis à jour",
        description: "Votre email a été modifié avec succès. Vérifiez votre boîte mail pour confirmer.",
      });
      setCurrentPassword('');
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour l'email",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentEmail">Email actuel</Label>
          <Input
            id="currentEmail"
            type="email"
            value={user?.email || ''}
            disabled
            className="bg-slate-50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="newEmail">Nouvel email</Label>
          <Input
            id="newEmail"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Entrez votre nouvel email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentPassword">Mot de passe actuel</Label>
          <Input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Confirmez avec votre mot de passe actuel"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button 
          onClick={handleUpdateEmail} 
          disabled={loading || !currentPassword || newEmail === user?.email}
        >
          {loading ? 'Mise à jour...' : 'Mettre à jour le profil'}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </div>
  );
};
