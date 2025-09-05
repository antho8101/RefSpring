
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const EmailSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [emailPassword, setEmailPassword] = useState('');

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
      setEmailPassword('');
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
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentEmail">Email actuel</Label>
        <Input
          id="currentEmail"
          type="email"
          value={user?.email || ''}
          disabled
          className="bg-slate-50 max-w-md"
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
          className="max-w-md"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="emailPassword">Mot de passe actuel</Label>
        <Input
          id="emailPassword"
          type="password"
          value={emailPassword}
          onChange={(e) => setEmailPassword(e.target.value)}
          placeholder="Confirmez avec votre mot de passe actuel"
          className="max-w-md"
        />
      </div>

      <Button 
        onClick={handleUpdateEmail} 
        disabled={loading || !emailPassword || newEmail === user?.email}
        className="w-full max-w-md"
      >
        {loading ? 'Mise à jour...' : 'Mettre à jour l\'email'}
      </Button>
    </div>
  );
};
