import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Affiliate } from '@/types';

interface AffiliatePaymentStatusProps {
  affiliate: Affiliate;
}

export const AffiliatePaymentStatus = ({ affiliate }: AffiliatePaymentStatusProps) => {
  // Déterminer le statut basé sur les données Stripe de l'affilié
  const hasStripeAccount = affiliate.stripeAccountId;
  const isSetupComplete = affiliate.stripeAccountStatus === 'verified';
  
  if (isSetupComplete) {
    return (
      <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
        <CheckCircle className="h-3 w-3 mr-1" />
        Configuré
      </Badge>
    );
  }
  
  if (hasStripeAccount) {
    return (
      <Badge variant="outline" className="text-orange-700 border-orange-200 bg-orange-50">
        <Clock className="h-3 w-3 mr-1" />
        En attente
      </Badge>
    );
  }
  
  return (
    <Badge variant="outline" className="text-slate-600 border-slate-200 bg-slate-50">
      <AlertCircle className="h-3 w-3 mr-1" />
      Non configuré
    </Badge>
  );
};