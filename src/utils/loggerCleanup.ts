/**
 * Utilitaire pour nettoyer automatiquement les console.log
 * et les remplacer par le système Logger approprié
 */

// Mappings des emojis vers les types de logger
const LOGGER_MAPPINGS = {
  '🔐': 'Logger.security',
  '🔒': 'Logger.admin', 
  '📊': 'Logger.campaign',
  '💳': 'Logger.payment',
  '🤝': 'Logger.affiliate',
  '🚨': 'Logger.error',
  '⚠️': 'Logger.warning',
  'ℹ️': 'Logger.info',
  '🐛': 'Logger.debug',
  '✅': 'Logger.info',
  '❌': 'Logger.error',
  '💰': 'Logger.payment',
  '📄': 'Logger.info',
  '🗑️': 'Logger.info',
  '📋': 'Logger.info',
  '🎉': 'Logger.info',
  '🚀': 'Logger.info',
  '🔍': 'Logger.debug',
  '💾': 'Logger.info',
  '🎯': 'Logger.debug',
  '🏠': 'Logger.debug',
  '📈': 'Logger.info',
  '🔄': 'Logger.info'
};

// Patterns de remplacement
export const getLoggerReplacement = (consoleStatement: string): string => {
  // Extraire l'emoji du message
  const emojiMatch = consoleStatement.match(/console\.(log|warn|error|info)\(['"`]([🔐🔒📊💳🤝🚨⚠️ℹ️🐛✅❌🔄💰📄🗑️📋🎉🚀🔍💾🎯🏠📈])/);
  
  if (emojiMatch) {
    const consoleType = emojiMatch[1];
    const emoji = emojiMatch[2];
    const loggerMethod = LOGGER_MAPPINGS[emoji as keyof typeof LOGGER_MAPPINGS] || 'Logger.info';
    
    // Nettoyer le message en supprimant l'emoji et les préfixes redondants
    let cleanedStatement = consoleStatement
      .replace(/console\.(log|warn|error|info)/, loggerMethod)
      .replace(/(['"`])([🔐🔒📊💳🤝🚨⚠️ℹ️🐛✅❌🔄💰📄🗑️📋🎉🚀🔍💾🎯🏠📈])\s*/, '$1')
      .replace(/SECURITY - |ADMIN - |CAMPAIGN - |PAYMENT - |AFFILIATE - |ERROR - |WARNING - |INFO - |DEBUG - /, '');
    
    return cleanedStatement;
  }
  
  // Fallback pour les console.log sans emojis
  if (consoleStatement.includes('console.log')) {
    return consoleStatement.replace('console.log', 'Logger.info');
  } else if (consoleStatement.includes('console.warn')) {
    return consoleStatement.replace('console.warn', 'Logger.warning');
  } else if (consoleStatement.includes('console.error')) {
    return consoleStatement.replace('console.error', 'Logger.error');
  }
  
  return consoleStatement;
};

// Liste des fichiers qui nécessitent l'import de Logger
export const FILES_NEEDING_LOGGER_IMPORT = [
  'src/components/AdminDashboard.tsx',
  'src/components/AffiliateDeleteDialog.tsx',
  'src/components/AuthRequiredDialog.tsx',
  'src/components/BillingHistorySettings.tsx',
  'src/components/CampaignDeletionDialog.tsx',
  'src/components/CampaignDeletionUtility.tsx',
  'src/components/CampaignGeneralSettings.tsx',
  'src/components/CampaignPaymentSettings.tsx',
  'src/components/CreateCampaignDialog.tsx',
  'src/components/CreateCampaignDialogSimple.tsx',
  'src/components/DashboardContent.tsx',
  'src/components/ProtectedRoute.tsx',
  'src/components/SecureActionWrapper.tsx',
  'src/components/StripeConnectButton.tsx',
  'src/components/TrackingLinkGenerator.tsx'
];