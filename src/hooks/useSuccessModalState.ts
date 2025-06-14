
import { useState, useRef, useCallback } from 'react';

interface SuccessModalData {
  campaignId: string;
  campaignName: string;
}

export const useSuccessModalState = () => {
  // État complètement isolé pour la modale de succès
  const [successModalData, setSuccessModalData] = useState<SuccessModalData | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Verrou absolu pour empêcher toute modification non autorisée
  const lockRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showSuccessModal = useCallback((campaignId: string, campaignName: string) => {
    console.log('🚀 SUCCESS MODAL: Affichage forcé avec verrouillage total');
    
    // Nettoyer tout timeout existant
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Activer le verrou ABSOLU
    lockRef.current = true;
    
    // Forcer les états de manière synchrone
    setSuccessModalData({ campaignId, campaignName });
    setShowConfetti(true);
    
    console.log('🚀 SUCCESS MODAL: États forcés:', { campaignId, campaignName, showConfetti: true });
    
    // Maintenir le verrou pendant 30 secondes (sécurité maximale)
    timeoutRef.current = setTimeout(() => {
      console.log('🔓 SUCCESS MODAL: Libération automatique du verrou après 30s');
      lockRef.current = false;
    }, 30000);
    
  }, []);

  const hideSuccessModal = useCallback(() => {
    console.log('🔒 SUCCESS MODAL: Fermeture manuelle autorisée');
    
    // Nettoyer le timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Libérer le verrou
    lockRef.current = false;
    
    // Réinitialiser les états
    setSuccessModalData(null);
    setShowConfetti(false);
  }, []);

  // Fonction de protection contre les resets non autorisés
  const protectedSetSuccessModalData = useCallback((data: SuccessModalData | null) => {
    if (lockRef.current && data === null) {
      console.log('🚫 SUCCESS MODAL: Tentative de reset bloquée par le verrou');
      return;
    }
    setSuccessModalData(data);
  }, []);

  const protectedSetShowConfetti = useCallback((show: boolean) => {
    if (lockRef.current && !show) {
      console.log('🚫 SUCCESS MODAL: Tentative de désactiver confetti bloquée par le verrou');
      return;
    }
    setShowConfetti(show);
  }, []);

  return {
    successModalData,
    showConfetti,
    isSuccessModalOpen: Boolean(successModalData),
    showSuccessModal,
    hideSuccessModal,
    // Exposer les setters protégés pour le debug
    setSuccessModalData: protectedSetSuccessModalData,
    setShowConfetti: protectedSetShowConfetti,
  };
};
