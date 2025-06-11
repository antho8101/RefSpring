
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

export interface TourStep {
  id: string;
  target: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: 'click' | 'hover' | 'none';
  nextButton?: string;
  skipButton?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    target: 'body',
    title: '🎉 Bienvenue sur RefSpring !',
    content: 'Félicitations ! Votre compte est créé. Laissez-nous vous faire découvrir votre nouveau dashboard d\'affiliation.',
    position: 'bottom',
    nextButton: 'Commencer la visite'
  },
  {
    id: 'header',
    target: '[data-tour="header"]',
    title: '📊 Votre Dashboard',
    content: 'Ici se trouve votre tableau de bord principal. Vous pouvez gérer votre profil et vous déconnecter depuis le menu.',
    position: 'bottom'
  },
  {
    id: 'stats-cards',
    target: '[data-tour="stats"]',
    title: '📈 Statistiques en Temps Réel',
    content: 'Ces cartes affichent vos performances : campagnes actives, affiliés, chiffre d\'affaires et taux de conversion.',
    position: 'bottom'
  },
  {
    id: 'period-filter',
    target: '[data-tour="period-toggle"]',
    title: '📅 Filtres de Période',
    content: 'Changez la période d\'analyse de vos statistiques : aujourd\'hui, cette semaine, ce mois ou tout le temps.',
    position: 'left'
  },
  {
    id: 'create-campaign',
    target: '[data-tour="create-campaign"]',
    title: '🚀 Créer une Campagne',
    content: 'Cliquez ici pour créer votre première campagne d\'affiliation. C\'est le cœur de votre activité !',
    position: 'left',
    action: 'hover'
  },
  {
    id: 'campaigns-list',
    target: '[data-tour="campaigns-list"]',
    title: '📋 Gestion des Campagnes',
    content: 'Ici vous retrouverez toutes vos campagnes. Vous pourrez les modifier, voir leurs statistiques et copier les liens de tracking.',
    position: 'top'
  },
  {
    id: 'footer',
    target: '[data-tour="footer"]',
    title: '🔗 Liens Utiles',
    content: 'Le footer contient des liens vers la documentation, le support et les mentions légales.',
    position: 'top'
  },
  {
    id: 'chat-support',
    target: '#tawkchat-iframe-container, .tawk-messenger-container, [id*="tawk"]',
    title: '💬 Support Client',
    content: 'Notre chat support est disponible 24/7 pour vous aider. N\'hésitez pas à nous contacter !',
    position: 'left'
  },
  {
    id: 'complete',
    target: 'body',
    title: '✨ Vous êtes prêt !',
    content: 'Parfait ! Vous connaissez maintenant votre dashboard. Créez votre première campagne pour commencer à générer des revenus.',
    position: 'bottom',
    nextButton: 'Terminer la visite'
  }
];

export const useGuidedTour = () => {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [tourCompleted, setTourCompleted] = useState(false);

  useEffect(() => {
    if (!user) return;

    const tourKey = `guided_tour_completed_${user.uid}`;
    const completed = localStorage.getItem(tourKey) === 'true';
    setTourCompleted(completed);
  }, [user]);

  const startTour = useCallback(() => {
    setIsActive(true);
    setCurrentStep(0);
    console.log('🎯 Starting guided tour');
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTour();
    }
  }, [currentStep]);

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const skipTour = useCallback(() => {
    setIsActive(false);
    completeTour();
  }, []);

  const completeTour = useCallback(() => {
    if (!user) return;
    
    const tourKey = `guided_tour_completed_${user.uid}`;
    localStorage.setItem(tourKey, 'true');
    setTourCompleted(true);
    setIsActive(false);
    console.log('🎯 Guided tour completed');
  }, [user]);

  const resetTour = useCallback(() => {
    if (!user) return;
    
    const tourKey = `guided_tour_completed_${user.uid}`;
    localStorage.removeItem(tourKey);
    setTourCompleted(false);
    setCurrentStep(0);
  }, [user]);

  return {
    isActive,
    currentStep,
    tourCompleted,
    currentStepData: TOUR_STEPS[currentStep],
    totalSteps: TOUR_STEPS.length,
    startTour,
    nextStep,
    previousStep,
    skipTour,
    completeTour,
    resetTour
  };
};
