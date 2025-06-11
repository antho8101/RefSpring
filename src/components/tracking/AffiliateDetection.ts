
export const createAffiliateDetection = () => `
  // Obtenir l'ID de campagne depuis l'attribut data-campaign
  const scriptTag = document.querySelector('script[data-campaign]');
  const campaignId = scriptTag ? scriptTag.getAttribute('data-campaign') : null;
  
  console.log('📊 RefSpring - Campaign ID détecté:', campaignId);
  
  if (!campaignId) {
    console.warn('⚠️ RefSpring - Aucun data-campaign trouvé dans le script');
    return;
  }
  
  // Vérifier les paramètres URL pour détecter l'affiliation
  const urlParams = new URLSearchParams(window.location.search);
  const affiliateFromUrl = urlParams.get('ref') || urlParams.get('affiliate');
  
  // 🔒 Récupération SÉCURISÉE des données d'affiliation
  let affiliateData = CryptoSystem.secureRetrieve('affiliate_data');
  let affiliateId = null;
  
  if (affiliateFromUrl) {
    // Nouveau visiteur affilié, stocker de manière SÉCURISÉE
    affiliateId = affiliateFromUrl;
    const data = {
      affiliateId: affiliateId,
      campaignId: campaignId,
      timestamp: new Date().toISOString(),
      source: 'url_param'
    };
    
    // 🔒 STOCKAGE CHIFFRÉ
    CryptoSystem.secureStore('affiliate_data', data);
    console.log('🔒 RefSpring - Nouvel affilié détecté et chiffré:', affiliateId);
  } else if (affiliateData) {
    // Visiteur revenant avec données chiffrées
    affiliateId = affiliateData.affiliateId;
    console.log('🔒 RefSpring - Affiliate existant déchiffré:', affiliateId);
  }
  
  return { affiliateId, campaignId };
`;
