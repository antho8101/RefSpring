
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export interface PaymentNotification {
  id: string;
  amount: number;
  dueDate: Date;
  campaignName?: string;
  type: 'commission' | 'platform_fee';
}

export const usePaymentNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<PaymentNotification[]>([]);
  const [dismissedNotifications, setDismissedNotifications] = useState<string[]>([]);
  const [snoozedNotifications, setSnoozedNotifications] = useState<Record<string, Date>>({});

  useEffect(() => {
    if (!user?.uid) return;

    // Charger les notifications depuis localStorage
    const dismissed = localStorage.getItem(`dismissed_payment_notifications_${user.uid}`);
    const snoozed = localStorage.getItem(`snoozed_payment_notifications_${user.uid}`);
    
    if (dismissed) {
      setDismissedNotifications(JSON.parse(dismissed));
    }
    
    if (snoozed) {
      const parsedSnoozed = JSON.parse(snoozed);
      // Convertir les dates string en Date objects
      const snoozedWithDates = Object.entries(parsedSnoozed).reduce((acc, [key, value]) => {
        acc[key] = new Date(value as string);
        return acc;
      }, {} as Record<string, Date>);
      setSnoozedNotifications(snoozedWithDates);
    }

    loadPaymentNotifications();
  }, [user?.uid]);

  const loadPaymentNotifications = async () => {
    // Simulation des notifications de paiement à venir
    // Dans un vrai système, ceci ferait une requête à la base de données
    const now = new Date();
    const fiveDaysFromNow = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
    
    // Simulation de notifications
    const mockNotifications: PaymentNotification[] = [
      {
        id: 'payment_1',
        amount: 127.50,
        dueDate: fiveDaysFromNow,
        campaignName: 'Campagne E-commerce',
        type: 'commission'
      }
    ];

    setNotifications(mockNotifications);
  };

  const dismissNotification = (notificationId: string, permanent: boolean = false) => {
    if (!user?.uid) return;

    if (permanent) {
      const newDismissed = [...dismissedNotifications, notificationId];
      setDismissedNotifications(newDismissed);
      localStorage.setItem(
        `dismissed_payment_notifications_${user.uid}`,
        JSON.stringify(newDismissed)
      );
    } else {
      // Snooze pour 24 heures
      const snoozeUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const newSnoozed = { ...snoozedNotifications, [notificationId]: snoozeUntil };
      setSnoozedNotifications(newSnoozed);
      localStorage.setItem(
        `snoozed_payment_notifications_${user.uid}`,
        JSON.stringify(newSnoozed)
      );
    }
  };

  // Filtrer les notifications visibles
  const visibleNotifications = notifications.filter(notification => {
    // Ne pas afficher si définitivement dismissée
    if (dismissedNotifications.includes(notification.id)) {
      return false;
    }

    // Ne pas afficher si snoozée et pas encore expirée
    const snoozeDate = snoozedNotifications[notification.id];
    if (snoozeDate && new Date() < snoozeDate) {
      return false;
    }

    // Afficher seulement si dans les 5 jours
    const now = new Date();
    const fiveDaysFromNow = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
    return notification.dueDate <= fiveDaysFromNow;
  });

  return {
    notifications: visibleNotifications,
    dismissNotification,
  };
};
