
import { useCallback } from 'react';
import { collection, addDoc, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useIPBlacklist } from './useIPBlacklist';

interface SuspiciousActivity {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  ip?: string;
  userAgent?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export const useSuspiciousActivity = () => {
  const { addToBlacklist, hashIP } = useIPBlacklist();

  // 🚨 ENREGISTREMENT D'ACTIVITÉ SUSPECTE RENFORCÉ
  const logSuspiciousActivity = useCallback(async (activity: SuspiciousActivity): Promise<void> => {
    try {
      console.log(`🚨 ANTIFRAUD - Activité ${activity.severity}:`, activity.type);
      
      await addDoc(collection(db, 'suspiciousActivities'), {
        ...activity,
        ip: activity.ip ? hashIP(activity.ip) : null,
        timestamp: new Date(),
        investigated: false,
        falsePositive: false
      });
      
      // 🚨 AUTO-BLACKLIST pour activités critiques
      if (activity.severity === 'critical' && activity.ip) {
        await addToBlacklist(activity.ip, `Auto-blacklist: ${activity.description}`, 'critical');
      }
      
      // Auto-blacklist pour activités high répétées
      if (activity.severity === 'high' && activity.ip) {
        // Vérifier si cette IP a déjà eu des activités suspectes
        const recentActivitiesQuery = query(
          collection(db, 'suspiciousActivities'),
          where('ip', '==', hashIP(activity.ip)),
          where('timestamp', '>', new Date(Date.now() - 24 * 60 * 60 * 1000)), // 24h
          limit(10)
        );
        
        const recentActivities = await getDocs(recentActivitiesQuery);
        if (recentActivities.size >= 3) {
          await addToBlacklist(activity.ip, `Auto-blacklist: ${recentActivities.size} activités suspectes en 24h`, 'high');
        }
      }
      
    } catch (error) {
      console.error('❌ ANTIFRAUD - Erreur enregistrement activité:', error);
    }
  }, [hashIP, addToBlacklist]);

  return {
    logSuspiciousActivity
  };
};
