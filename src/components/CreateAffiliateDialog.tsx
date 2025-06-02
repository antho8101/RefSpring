
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
  
  const { createAffiliate } = useAffiliates();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createAffiliate({
        ...formData,
        campaignId,
        isActive: true,
      });
      
      toast({
        title: "Affilié ajouté",
        description: `${formData.name} a été ajouté à la campagne ${campaignName}`,
      });
      
      setOpen(false);
      setFormData({ name: '', email: '', commissionRate: 10 });
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="hover:scale-105 transition-all shadow-lg backdrop-blur-sm border-slate-300">
          <UserPlus className="h-4 w-4 mr-2" />
          Ajouter un affilié
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-xl border-slate-200">
        <DialogHeader>
          <DialogTitle>Ajouter un affilié</DialogTitle>
          <DialogDescription>
            Ajoutez un nouvel affilié à la campagne "{campaignName}"
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Jean Dupont"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="jean@exemple.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="commissionRate">Taux de commission (%)</Label>
              <Input
                id="commissionRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.commissionRate}
                onChange={(e) => setFormData({ ...formData, commissionRate: parseFloat(e.target.value) })}
                placeholder="10"
                required
              />
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
