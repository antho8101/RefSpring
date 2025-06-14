
import React, { createContext, useContext, useState, useRef, useCallback, ReactNode } from 'react';

interface SuccessModalData {
  campaignId: string;
  campaignName: string;
}

interface SuccessModalContextType {
  successModalData: SuccessModalData | null;
  showConfetti: boolean;
  isSuccessModalOpen: boolean;
  showSuccessModal: (campaignId: string, campaignName: string) => void;
  hideSuccessModal: () => void;
}

const SuccessModalContext = createContext<SuccessModalContextType | undefined>(undefined);

export const SuccessModalProvider = ({ children }: { children: ReactNode }) => {
  const [successModalData, setSuccessModalData] = useState<SuccessModalData | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const lockRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  console.log('🌍 SUCCESS MODAL CONTEXT: État global:', {
    successModalData,
    showConfetti,
    isSuccessModalOpen: Boolean(successModalData),
    lockActive: lockRef.current
  });

  const showSuccessModal = useCallback((campaignId: string, campaignName: string) => {
    console.log('🌍 SUCCESS MODAL CONTEXT: showSuccessModal appelé avec:', { campaignId, campaignName });
    
    // Nettoyer tout timeout existant
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Activer le verrou
    lockRef.current = true;
    console.log('🔒 SUCCESS MODAL CONTEXT: Verrou activé');
    
    // Forcer les états
    console.log('🔄 SUCCESS MODAL CONTEXT: Avant setSuccessModalData');
    setSuccessModalData({ campaignId, campaignName });
    console.log('🔄 SUCCESS MODAL CONTEXT: Après setSuccessModalData');
    
    console.log('🔄 SUCCESS MODAL CONTEXT: Avant setShowConfetti');
    setShowConfetti(true);
    console.log('🔄 SUCCESS MODAL CONTEXT: Après setShowConfetti');
    
    console.log('✅ SUCCESS MODAL CONTEXT: États forcés terminés');
    
    // Maintenir le verrou pendant 30 secondes
    timeoutRef.current = setTimeout(() => {
      console.log('🔓 SUCCESS MODAL CONTEXT: Libération automatique du verrou après 30s');
      lockRef.current = false;
    }, 30000);
    
  }, []);

  const hideSuccessModal = useCallback(() => {
    console.log('🔒 SUCCESS MODAL CONTEXT: hideSuccessModal appelé');
    
    // Nettoyer le timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Libérer le verrou
    lockRef.current = false;
    console.log('🔓 SUCCESS MODAL CONTEXT: Verrou libéré');
    
    // Réinitialiser les états
    console.log('🔄 SUCCESS MODAL CONTEXT: Reset des états');
    setSuccessModalData(null);
    setShowConfetti(false);
  }, []);

  const value = {
    successModalData,
    showConfetti,
    isSuccessModalOpen: Boolean(successModalData),
    showSuccessModal,
    hideSuccessModal,
  };

  console.log('🎯 SUCCESS MODAL CONTEXT: Valeur fournie:', {
    'successModalData': value.successModalData,
    'isSuccessModalOpen': value.isSuccessModalOpen,
    'showConfetti': value.showConfetti
  });

  return (
    <SuccessModalContext.Provider value={value}>
      {children}
    </SuccessModalContext.Provider>
  );
};

export const useSuccessModal = () => {
  const context = useContext(SuccessModalContext);
  if (context === undefined) {
    throw new Error('useSuccessModal must be used within a SuccessModalProvider');
  }
  
  console.log('🔌 SUCCESS MODAL HOOK: Context récupéré:', {
    'successModalData': context.successModalData,
    'isSuccessModalOpen': context.isSuccessModalOpen,
    'showConfetti': context.showConfetti
  });
  
  return context;
};
