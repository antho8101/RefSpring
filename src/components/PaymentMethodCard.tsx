
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Trash2, Pause } from 'lucide-react';
import { CriticalActionConfirmDialog } from '@/components/CriticalActionConfirmDialog';

interface Campaign {
  id: string;
  name: string;
  isActive: boolean;
}

interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  brand: string;
  exp_month: number;
  exp_year: number;
  isDefault?: boolean;
}

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod;
  linkedCampaigns: Campaign[];
  onDelete: (paymentMethodId: string) => void;
  isDeleting?: boolean;
}

export const PaymentMethodCard = ({ 
  paymentMethod, 
  linkedCampaigns, 
  onDelete,
  isDeleting = false 
}: PaymentMethodCardProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = () => {
    onDelete(paymentMethod.id);
    setDeleteDialogOpen(false);
  };

  const activeCampaigns = linkedCampaigns.filter(c => c.isActive);
  const hasLinkedCampaigns = linkedCampaigns.length > 0;

  const getCardIcon = (brand: string) => {
    // Retourner l'icône appropriée selon la marque
    return <CreditCard className="h-5 w-5" />;
  };

  const getDeleteDescription = () => {
    if (!hasLinkedCampaigns) {
      return "Cette action supprimera définitivement cette carte bancaire de votre compte.";
    }

    return `Cette action va supprimer la carte et mettre en pause ${linkedCampaigns.length} campagne(s) liée(s) :
    
${linkedCampaigns.map(c => `• ${c.name}${c.isActive ? ' (active)' : ' (inactive)'}`).join('\n')}

Les campagnes devront être reconfigurées avec une nouvelle carte pour être réactivées.`;
  };

  return (
    <>
      <Card className="relative">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-3">
              {getCardIcon(paymentMethod.brand)}
              <div>
                <div className="flex items-center gap-2">
                  <span className="capitalize">{paymentMethod.brand}</span>
                  <span>•••• {paymentMethod.last4}</span>
                  {paymentMethod.isDefault && (
                    <Badge variant="outline" className="text-xs">
                      Par défaut
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-600 font-normal">
                  Expire {paymentMethod.exp_month.toString().padStart(2, '0')}/{paymentMethod.exp_year}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-0">
          {hasLinkedCampaigns ? (
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700">
                Campagnes liées ({linkedCampaigns.length})
              </p>
              <div className="space-y-2">
                {linkedCampaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50"
                  >
                    <span className="text-sm text-slate-700">{campaign.name}</span>
                    <div className="flex items-center gap-2">
                      {campaign.isActive ? (
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-slate-500 border-slate-200">
                          <Pause className="h-3 w-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Aucune campagne liée</p>
          )}
        </CardContent>
      </Card>

      <CriticalActionConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Supprimer la carte bancaire"
        description={getDeleteDescription()}
        confirmText={hasLinkedCampaigns ? "Supprimer et mettre en pause" : "Supprimer"}
        onConfirm={handleDelete}
        variant="danger"
      />
    </>
  );
};
