
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useAffiliates } from '@/hooks/useAffiliates';
import { useToast } from '@/hooks/use-toast';
import { Edit2, Trash2 } from 'lucide-react';
import { Affiliate } from '@/types';

interface AffiliateManagementDialogProps {
  affiliate: Affiliate;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'edit' | 'delete';
}

export const AffiliateManagementDialog = ({ affiliate, open, onOpenChange, mode }: AffiliateManagementDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: affiliate.name,
    email: affiliate.email,
    commissionRate: affiliate.commissionRate,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const { updateAffiliate, deleteAffiliate } = useAffiliates();
  const { toast } = useToast();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateAffiliate(affiliate.id, formData);
      
      toast({
        title: "Affilié mis à jour",
        description: `Les informations de ${formData.name} ont été mises à jour`,
      });
      
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour l'affilié",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);

    try {
      await deleteAffiliate(affiliate.id);
      
      toast({
        title: "Affilié supprimé",
        description: `${affiliate.name} a été supprimé`,
      });
      
      setShowDeleteConfirm(false);
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer l'affilié",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'delete') {
    return (
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="bg-white border border-slate-200 rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'affilié</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer <strong>{affiliate.name}</strong> ?
              Cette action est irréversible et supprimera toutes les données associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px] bg-white border border-slate-200 rounded-xl">
          <DialogHeader>
            <DialogTitle>Modifier l'affilié</DialogTitle>
            <DialogDescription>
              Modifiez les informations de <strong>{affiliate.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  required
                />
              </div>
            </div>
            
            <DialogFooter className="gap-2">
              <Button 
                type="button" 
                variant="destructive" 
                onClick={() => setShowDeleteConfirm(true)}
                className="mr-auto border border-red-300"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
              <Button type="submit" disabled={loading} className="border border-slate-300">
                {loading ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="bg-white border border-slate-200 rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer l'affilié</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer <strong>{affiliate.name}</strong> ?
              Cette action est irréversible et supprimera toutes les données associées.
              <br /><br />
              <strong>Note :</strong> Si cet affilié a déjà généré du chiffre d'affaires, 
              il sera payé dans tous les cas selon les commissions dues.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
