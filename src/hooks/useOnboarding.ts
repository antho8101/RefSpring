
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export const useOnboarding = () => {
  const { user } = useAuth();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Clé unique par utilisateur
    const storageKey = `onboarding_completed_${user.uid}`;
    const completed = localStorage.getItem(storageKey) === 'true';
    
    setHasSeenOnboarding(completed);
    setLoading(false);
  }, [user]);

  const markOnboardingCompleted = () => {
    if (!user) return;
    
    const storageKey = `onboarding_completed_${user.uid}`;
    localStorage.setItem(storageKey, 'true');
    setHasSeenOnboarding(true);
  };

  return {
    hasSeenOnboarding,
    markOnboardingCompleted,
    loading
  };
};
