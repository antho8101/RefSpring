/**
 * Corrections des problèmes logiques identifiés dans l'audit
 */

import { useState, useCallback, useEffect } from 'react';
import { safeDivision, safePercentage, safeNumber, createAbortableEffect } from '@/utils/safeOperations';

// Fix pour les calculs de conversion rate avec division par zéro
export const calculateSafeConversionRate = (conversions: number, clicks: number): number => {
  return safePercentage(conversions, clicks, 1);
};

// Fix pour les calculs de revenus avec protection NaN/Infinity
export const calculateSafeRevenue = (conversions: Array<{ amount?: string | number }>): number => {
  return conversions.reduce((sum, conv) => {
    const amount = safeNumber(conv.amount, 0);
    return sum + amount;
  }, 0);
};

// Fix pour les calculs de commissions avec validation
export const calculateSafeCommissions = (conversions: Array<{ commission?: string | number }>): number => {
  return conversions.reduce((sum, conv) => {
    const commission = safeNumber(conv.commission, 0);
    return sum + commission;
  }, 0);
};

// Hook pour gestion sécurisée des états de loading
export const useSafeLoadingState = () => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  
  const setLoading = useCallback((key: string, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading
    }));
  }, []);
  
  const isLoading = useCallback((key: string) => {
    return loadingStates[key] ?? false;
  }, [loadingStates]);
  
  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(Boolean);
  }, [loadingStates]);
  
  return { setLoading, isLoading, isAnyLoading };
};

// Fix pour les race conditions dans les effects
export const useSafeEffect = (
  effect: (abortController: AbortController) => void | (() => void),
  deps: Parameters<typeof useEffect>[1]
) => {
  useEffect(() => {
    const { controller, cleanup } = createAbortableEffect();
    
    let effectCleanup: void | (() => void);
    
    try {
      effectCleanup = effect(controller);
    } catch (error) {
      console.error('Safe effect error:', error);
    }
    
    return () => {
      cleanup();
      if (typeof effectCleanup === 'function') {
        effectCleanup();
      }
    };
  }, deps);
};

// Validation des états de campagne pour éviter les incohérences
export const validateCampaignState = (campaign: {
  isActive?: boolean;
  isDraft?: boolean;
  paymentConfigured?: boolean;
}) => {
  const issues: string[] = [];
  
  // Une campagne ne peut pas être active et brouillon en même temps
  if (campaign.isActive && campaign.isDraft) {
    issues.push('Campaign cannot be both active and draft');
  }
  
  // Une campagne active doit avoir le paiement configuré
  if (campaign.isActive && !campaign.paymentConfigured) {
    issues.push('Active campaign must have payment configured');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
};

// Validation des états d'affilié
export const validateAffiliateState = (affiliate: {
  isActive?: boolean;
  commissionRate?: number;
  stripeAccountStatus?: string;
}) => {
  const issues: string[] = [];
  
  // Taux de commission doit être valide
  if (affiliate.commissionRate !== undefined) {
    const rate = safeNumber(affiliate.commissionRate, 0);
    if (rate < 0 || rate > 100) {
      issues.push('Commission rate must be between 0 and 100');
    }
  }
  
  // Un affilié actif devrait avoir un compte Stripe vérifié
  if (affiliate.isActive && affiliate.stripeAccountStatus === 'incomplete') {
    issues.push('Active affiliate should have complete Stripe account');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
};

// Réconciliation des données pour éviter les incohérences
export const reconcileDataConsistency = (
  campaigns: Array<{ id: string; isActive: boolean }>,
  affiliates: Array<{ id: string; campaignId: string; isActive: boolean }>,
  conversions: Array<{ campaignId: string; affiliateId: string }>
) => {
  const issues: string[] = [];
  
  // Vérifier que tous les affiliés référencent des campagnes existantes
  const campaignIds = new Set(campaigns.map(c => c.id));
  affiliates.forEach(affiliate => {
    if (!campaignIds.has(affiliate.campaignId)) {
      issues.push(`Affiliate references non-existent campaign: ${affiliate.campaignId}`);
    }
  });
  
  // Vérifier que toutes les conversions référencent des entités existantes
  const affiliateIds = new Set(affiliates.map(a => a.id));
  conversions.forEach(conversion => {
    if (!campaignIds.has(conversion.campaignId)) {
      issues.push(`Conversion references non-existent campaign: ${conversion.campaignId}`);
    }
    if (!affiliateIds.has(conversion.affiliateId)) {
      issues.push(`Conversion references non-existent affiliate: ${conversion.affiliateId}`);
    }
  });
  
  return {
    isConsistent: issues.length === 0,
    issues
  };
};