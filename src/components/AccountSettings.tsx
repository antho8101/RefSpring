
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

interface AccountSettingsProps {
  onCancel: () => void;
}

export const AccountSettings = ({ onCancel }: AccountSettingsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Email settings
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [emailPassword, setEmailPassword] = useState('');
  
  // Password settings
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdateEmail = async () => {
    if (!user || !emailPassword) {
      toast({
        title: "Erreur",
        description: "Mot de passe actuel requis",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email!, emailPassword);
      await reauthenticateWithCredential(user, credential);
      
      await updateEmail(user, newEmail);
      toast({
        title: "Email mis à jour",
        description: "Votre email a été modifié avec succès",
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

  const handleUpdatePassword = async () => {
    if (!user || !currentPassword || !newPassword) {
      toast({
        title: "Erreur",
        description: "Tous les champs sont requis",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      await updatePassword(user, newPassword);
      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été modifié avec succès",
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le mot de passe",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Email Section */}
      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-medium text-slate-900">Adresse email</h4>
          <p className="text-sm text-slate-600">Modifiez votre adresse email</p>
        </div>
        
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
      </div>

      <Separator />

      {/* Password Section */}
      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-medium text-slate-900">Mot de passe</h4>
          <p className="text-sm text-slate-600">Modifiez votre mot de passe</p>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Mot de passe actuel</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Entrez votre mot de passe actuel"
              className="max-w-md"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Entrez votre nouveau mot de passe"
              className="max-w-md"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmez votre nouveau mot de passe"
              className="max-w-md"
            />
          </div>

          <Button 
            onClick={handleUpdatePassword} 
            disabled={loading || !currentPassword || !newPassword || !confirmPassword}
            className="w-full max-w-md"
          >
            {loading ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
          </Button>
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel}>
          Fermer
        </Button>
      </div>
    </div>
  );
};
