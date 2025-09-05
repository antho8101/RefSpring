
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAffiliates } from '@/hooks/useAffiliates';
import { useToast } from '@/hooks/use-toast';
import { UserPlus } from 'lucide-react';

interface CreateAffiliateDialogProps {
  campaignId: string;
  campaignName: string;
}

export const CreateAffiliateDialog = ({ campaignId, campaignName }: CreateAffiliateDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    commissionRate: 10,
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    commissionRate: '',
  });
  
  const { createAffiliate } = useAffiliates();
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {
      name: '',
      email: '',
      commissionRate: '',
    };

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est obligatoire';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est obligatoire pour envoyer les paiements';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Veuillez entrer une adresse email valide';
    }

    if (formData.commissionRate < 0 || formData.commissionRate > 100) {
      newErrors.commissionRate = 'Le taux de commission doit être entre 0 et 100%';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await createAffiliate({
        ...formData,
        campaignId,
      });
      
      toast({
        title: "Affilié ajouté",
        description: `${formData.name} a été ajouté à la campagne ${campaignName}`,
      });
      
      setOpen(false);
      setFormData({ name: '', email: '', commissionRate: 10 });
      setErrors({ name: '', email: '', commissionRate: '' });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter l'affilié",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData({ ...formData, [field]: value });
    
    // Effacer l'erreur quand l'utilisateur commence à taper
    if (errors[field as keyof typeof errors]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-slate-300 rounded-xl">
          <UserPlus className="h-4 w-4 mr-2" />
          Ajouter un affilié
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white border border-slate-200 rounded-xl">
        <DialogHeader>
          <DialogTitle>Ajouter un affilié</DialogTitle>
          <DialogDescription>
            Ajoutez un nouvel affilié à la campagne "{campaignName}". L'email est obligatoire pour l'envoi des paiements.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ex: Jean Dupont"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="jean@exemple.com"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
              <p className="text-xs text-gray-500">
                Obligatoire pour l'envoi des paiements de commissions
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="commissionRate">Taux de commission (%) *</Label>
              <Input
                id="commissionRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.commissionRate}
                onChange={(e) => handleInputChange('commissionRate', parseFloat(e.target.value))}
                placeholder="10"
                className={errors.commissionRate ? 'border-red-500' : ''}
              />
              {errors.commissionRate && (
                <p className="text-sm text-red-500">{errors.commissionRate}</p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Ajout...' : 'Ajouter l\'affilié'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
