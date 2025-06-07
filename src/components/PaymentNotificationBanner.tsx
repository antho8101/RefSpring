
import { X, Clock, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { usePaymentNotifications, PaymentNotification } from '@/hooks/usePaymentNotifications';

interface PaymentNotificationBannerProps {
  notification: PaymentNotification;
  onDismiss: (notificationId: string, permanent: boolean) => void;
}

const PaymentNotificationItem = ({ notification, onDismiss }: PaymentNotificationBannerProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return format(date, 'dd MMMM yyyy à HH:mm', { locale: fr });
  };

  return (
    <Alert className="bg-blue-50 border-blue-200 mb-4">
      <CreditCard className="h-4 w-4 text-blue-600" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <span className="text-blue-800 font-medium">
            Prochain paiement dû : {formatCurrency(notification.amount)} le {formatDate(notification.dueDate)}
          </span>
          {notification.campaignName && (
            <span className="text-blue-600 text-sm">
              • {notification.campaignName}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDismiss(notification.id, false)}
            className="text-blue-700 border-blue-300 hover:bg-blue-100"
          >
            <Clock className="h-3 w-3 mr-1" />
            Me le rappeler plus tard
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDismiss(notification.id, true)}
            className="text-blue-700 border-blue-300 hover:bg-blue-100"
          >
            <X className="h-3 w-3 mr-1" />
            Ne plus me rappeler
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export const PaymentNotificationBanner = () => {
  const { notifications, dismissNotification } = usePaymentNotifications();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <PaymentNotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={dismissNotification}
        />
      ))}
    </div>
  );
};
