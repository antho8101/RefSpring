
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

  // LOG CONSTANT pour voir l'état interne
  console.log('🔍 SUCCESS MODAL STATE INTERNAL:', {
    successModalData,
    showConfetti,
    isSuccessModalOpen: Boolean(successModalData),
    lockActive: lockRef.current
  });

  const showSuccessModal = useCallback((campaignId: string, campaignName: string) => {
    console.log('🚀 SUCCESS MODAL: showSuccessModal appelé avec:', { campaignId, campaignName });
    
    // Nettoyer tout timeout existant
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Activer le verrou ABSOLU
    lockRef.current = true;
    console.log('🔒 SUCCESS MODAL: Verrou activé');
    
    // Forcer les états de manière synchrone
    console.log('🔄 SUCCESS MODAL: Avant setSuccessModalData');
    setSuccessModalData({ campaignId, campaignName });
    console.log('🔄 SUCCESS MODAL: Après setSuccessModalData');
    
    console.log('🔄 SUCCESS MODAL: Avant setShowConfetti');
    setShowConfetti(true);
    console.log('🔄 SUCCESS MODAL: Après setShowConfetti');
    
    console.log('✅ SUCCESS MODAL: États forcés synchrones terminés');
    
    // Maintenir le verrou pendant 30 secondes (sécurité maximale)
    timeoutRef.current = setTimeout(() => {
      console.log('🔓 SUCCESS MODAL: Libération automatique du verrou après 30s');
      lockRef.current = false;
    }, 30000);
    
  }, []);

  const hideSuccessModal = useCallback(() => {
    console.log('🔒 SUCCESS MODAL: hideSuccessModal appelé');
    
    // Nettoyer le timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Libérer le verrou
    lockRef.current = false;
    console.log('🔓 SUCCESS MODAL: Verrou libéré');
    
    // Réinitialiser les états
    console.log('🔄 SUCCESS MODAL: Reset des états');
    setSuccessModalData(null);
    setShowConfetti(false);
  }, []);

  // Fonction de protection contre les resets non autorisés
  const protectedSetSuccessModalData = useCallback((data: SuccessModalData | null) => {
    if (lockRef.current && data === null) {
      console.log('🚫 SUCCESS MODAL: Tentative de reset bloquée par le verrou');
      return;
    }
    console.log('🔄 SUCCESS MODAL: protectedSetSuccessModalData appelé avec:', data);
    setSuccessModalData(data);
  }, []);

  const protectedSetShowConfetti = useCallback((show: boolean) => {
    if (lockRef.current && !show) {
      console.log('🚫 SUCCESS MODAL: Tentative de désactiver confetti bloquée par le verrou');
      return;
    }
    console.log('🔄 SUCCESS MODAL: protectedSetShowConfetti appelé avec:', show);
    setShowConfetti(show);
  }, []);

  const result = {
    successModalData,
    showConfetti,
    isSuccessModalOpen: Boolean(successModalData),
    showSuccessModal,
    hideSuccessModal,
    // Exposer les setters protégés pour le debug
    setSuccessModalData: protectedSetSuccessModalData,
    setShowConfetti: protectedSetShowConfetti,
  };

  console.log('🎯 SUCCESS MODAL STATE: Retour du hook:', {
    'successModalData': result.successModalData,
    'isSuccessModalOpen': result.isSuccessModalOpen,
    'showConfetti': result.showConfetti
  });

  return result;
};
