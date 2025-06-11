
export const createSecureAPI = () => `
  // 🛡️ API PUBLIQUE SÉCURISÉE avec protection anti-injection
  window.RefSpring = window.RefSpring || {};
  
  // Protection contre les appels console
  const isCalledFromConsole = function() {
    const stack = new Error().stack || '';
    return stack.includes('eval') || stack.includes('<anonymous>');
  };
  
  window.RefSpring.trackConversion = function(amount, customCommission) {
    // 🚨 DÉTECTION INJECTION CONSOLE
    if (isCalledFromConsole()) {
      console.warn('🚨 RefSpring - Tentative d\\'injection console détectée !');
      console.warn('🛡️ RefSpring - Cette tentative a été bloquée et enregistrée');
      
      // Logger l'activité suspecte de manière chiffrée
      CryptoSystem.secureStore('suspicious_console_activity', {
        type: 'console_injection_attempt',
        amount: amount,
        customCommission: customCommission,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
      
      return false;
    }
    
    // 🔒 Récupérer automatiquement les données chiffrées
    const storedAffiliateData = CryptoSystem.secureRetrieve('affiliate_data');
    
    if (!storedAffiliateData) {
      console.warn('⚠️ RefSpring - Impossible de tracker conversion: pas d\\'affilié associé');
      return false;
    }
    
    const currentAffiliateId = storedAffiliateData.affiliateId;
    const currentCampaignId = storedAffiliateData.campaignId;
    
    // 🔒 Créer signature pour cette conversion
    const conversionData = {
      amount: amount,
      customCommission: customCommission,
      affiliateId: currentAffiliateId,
      campaignId: currentCampaignId,
      timestamp: Date.now(),
      url: window.location.href
    };
    
    const signature = CryptoSystem.signData(conversionData);
    
    // 🔒 Vérifier les doublons avec système chiffré
    const recentConversions = CryptoSystem.secureRetrieve('recent_conversions') || [];
    const isDuplicate = recentConversions.some(function(conv) {
      return Math.abs(conv.amount - amount) < 100 && 
             Date.now() - conv.timestamp < 60000;
    });
    
    if (isDuplicate) {
      console.warn('🔒 RefSpring - Conversion en double détectée (système crypto)');
      return false;
    }
    
    console.log('💰 RefSpring - Tracking conversion SÉCURISÉ:', {
      amount: amount,
      commission: customCommission || 'auto-calculated',
      affiliateId: currentAffiliateId,
      campaignId: currentCampaignId,
      signature: signature.substring(0, 20) + '...',
      timestamp: new Date().toISOString()
    });
    
    // 🔒 Enregistrer la conversion de manière chiffrée
    const conversionRecord = {
      ...conversionData,
      signature: signature
    };
    
    recentConversions.push(conversionRecord);
    
    // Nettoyer les anciennes conversions
    const filtered = recentConversions.filter(function(conv) {
      return Date.now() - conv.timestamp < 10 * 60 * 1000;
    }).slice(-10);
    
    CryptoSystem.secureStore('recent_conversions', filtered);
    
    return true;
  };
  
  // 🛡️ Protection contre la modification de l'API
  Object.freeze(window.RefSpring);
`;
