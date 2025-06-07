
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
  const [loading, setLoading] = useState(false);
  const isMountedRef = useRef(true);

  // Cleanup function pour éviter les fuites mémoire
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!user?.uid || !isMountedRef.current) return;

    // Charger les notifications depuis localStorage
    const dismissed = localStorage.getItem(`dismissed_payment_notifications_${user.uid}`);
    const snoozed = localStorage.getItem(`snoozed_payment_notifications_${user.uid}`);
    
    if (dismissed && isMountedRef.current) {
      setDismissedNotifications(JSON.parse(dismissed));
    }
    
    if (snoozed && isMountedRef.current) {
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
    if (!user?.uid || !isMountedRef.current) return;
    
    if (isMountedRef.current) {
      setLoading(true);
    }
    
    try {
      console.log('💰 NOTIFICATIONS - Calcul du montant réel dû pour:', user.uid);
      
      // Récupérer toutes les campagnes de l'utilisateur
      const campaignsQuery = query(
        collection(db, 'campaigns'), 
        where('userId', '==', user.uid)
      );
      const campaignsSnapshot = await getDocs(campaignsQuery);
      const campaignIds = campaignsSnapshot.docs.map(doc => doc.id);
      
      if (campaignIds.length === 0) {
        console.log('💰 NOTIFICATIONS - Aucune campagne trouvée');
        if (isMountedRef.current) {
          setNotifications([]);
          setLoading(false);
        }
        return;
      }

      // Calculer la date du dernier paiement (5 du mois dernier)
      const now = new Date();
      const lastPaymentDate = new Date(now.getFullYear(), now.getMonth() - 1, 5);
      
      // Calculer la prochaine date de paiement (5 du mois prochain)
      const nextPaymentDate = new Date(now.getFullYear(), now.getMonth() + 1, 5);
      
      console.log('💰 NOTIFICATIONS - Période de calcul:', {
        depuis: lastPaymentDate,
        prochainPaiement: nextPaymentDate
      });

      // Récupérer toutes les conversions depuis le dernier paiement
      const conversionsQuery = query(
        collection(db, 'conversions'),
        where('campaignId', 'in', campaignIds)
      );
      const conversionsSnapshot = await getDocs(conversionsQuery);
      
      let totalRevenue = 0;
      let totalCommissions = 0;
      let conversionsCount = 0;

      conversionsSnapshot.docs.forEach(doc => {
        const conversion = doc.data();
        const conversionDate = conversion.timestamp instanceof Date 
          ? conversion.timestamp 
          : conversion.timestamp.toDate();

        // Filtrer les conversions depuis le dernier paiement
        if (conversionDate >= lastPaymentDate) {
          const amount = parseFloat(conversion.amount) || 0;
          const commission = parseFloat(conversion.commission) || 0;
          
          totalRevenue += amount;
          totalCommissions += commission;
          conversionsCount++;
        }
      });

      // Calculer la commission RefSpring (2.5% du CA)
      const platformFee = totalRevenue * 0.025;
      
      // Montant total à payer (commissions affiliés + commission RefSpring)
      const totalAmountDue = totalCommissions + platformFee;

      console.log('💰 NOTIFICATIONS - Calculs réels:', {
        totalRevenue,
        totalCommissions,
        platformFee,
        totalAmountDue,
        conversionsCount
      });

      // Créer la notification seulement s'il y a quelque chose à payer et si le composant est toujours monté
      if (totalAmountDue > 0 && isMountedRef.current) {
        const notification: PaymentNotification = {
          id: 'monthly_payment',
          amount: totalAmountDue,
          dueDate: nextPaymentDate,
          type: 'platform_fee'
        };

        setNotifications([notification]);
      } else if (isMountedRef.current) {
        console.log('💰 NOTIFICATIONS - Aucun montant dû');
        setNotifications([]);
      }
    } catch (error) {
      console.error('❌ NOTIFICATIONS - Erreur calcul montant dû:', error);
      if (isMountedRef.current) {
        setNotifications([]);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const dismissNotification = (notificationId: string, permanent: boolean = false) => {
    if (!user?.uid || !isMountedRef.current) return;

    if (permanent) {
      const newDismissed = [...dismissedNotifications, notificationId];
      if (isMountedRef.current) {
        setDismissedNotifications(newDismissed);
      }
      localStorage.setItem(
        `dismissed_payment_notifications_${user.uid}`,
        JSON.stringify(newDismissed)
      );
    } else {
      // Snooze pour 24 heures
      const snoozeUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const newSnoozed = { ...snoozedNotifications, [notificationId]: snoozeUntil };
      if (isMountedRef.current) {
        setSnoozedNotifications(newSnoozed);
      }
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

    return true;
  });

  return {
    notifications: visibleNotifications,
    dismissNotification,
    loading,
  };
};
