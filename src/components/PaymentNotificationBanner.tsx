
import { X, Clock, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <CreditCard className="h-5 w-5 text-blue-600 flex-shrink-0" />
          <span className="text-blue-800 font-medium text-sm sm:text-base">
            Prochain paiement dû : {formatCurrency(notification.amount)} le {formatDate(notification.dueDate)}
          </span>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDismiss(notification.id, false)}
            className="text-blue-700 border-blue-300 hover:bg-blue-100 rounded-xl justify-center"
          >
            <Clock className="h-3 w-3 mr-1" />
            Me le rappeler plus tard
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDismiss(notification.id, true)}
            className="text-blue-700 border-blue-300 hover:bg-blue-100 rounded-xl justify-center"
          >
            <X className="h-3 w-3 mr-1" />
            Ne plus me rappeler
          </Button>
        </div>
      </div>
    </div>
  );
};

export const PaymentNotificationBanner = () => {
  const { notifications, dismissNotification } = usePaymentNotifications();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
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
