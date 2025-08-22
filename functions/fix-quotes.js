const fs = require('fs');
const path = require('path');

// Fonction pour corriger les guillemets dans un fichier
function fixQuotesInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remplacer les guillemets simples par des guillemets doubles
    // Attention aux guillemets dans les chaînes et échappements
    content = content.replace(/'/g, '"');
    
    // Corriger certains cas spéciaux
    content = content.replace(/"use strict"/g, '"use strict"');
    content = content.replace(/doesn"t/g, "doesn't");
    content = content.replace(/can"t/g, "can't");
    content = content.replace(/won"t/g, "won't");
    content = content.replace(/couldn"t/g, "couldn't");
    content = content.replace(/shouldn"t/g, "shouldn't");
    content = content.replace(/wouldn"t/g, "wouldn't");
    content = content.replace(/isn"t/g, "isn't");
    content = content.replace(/aren"t/g, "aren't");
    content = content.replace(/wasn"t/g, "wasn't");
    content = content.replace(/weren"t/g, "weren't");
    content = content.replace(/hasn"t/g, "hasn't");
    content = content.replace(/haven"t/g, "haven't");
    content = content.replace(/hadn"t/g, "hadn't");
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed quotes in: ${filePath}`);
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
}

// Liste des fichiers TypeScript à corriger
const tsFiles = [
  'src/antifraudCheck.ts',
  'src/calculateCommissions.ts', 
  'src/index.ts',
  'src/pluginAPI.ts',
  'src/processConversionQueue.ts',
  'src/processStripeWebhook.ts',
  'src/shopifyApp.ts',
  'src/shopifyOAuth.ts', 
  'src/shopifySetup.ts',
  'src/shopifyWebhooks.ts',
  'src/stripeCheckSetup.ts',
  'src/stripeConfig.ts',
  'src/stripeConnectAccount.ts',
  'src/stripeCreateSetup.ts',
  'src/stripeDeletePaymentMethod.ts',
  'src/stripeGetPaymentMethods.ts',
  'src/stripeInvoice.ts',
  'src/stripeSetDefaultPaymentMethod.ts',
  'src/validateCampaignData.ts',
  'src/validateTracking.ts'
];

console.log('Fixing quotes in TypeScript files...');

tsFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    fixQuotesInFile(fullPath);
  } else {
    console.log(`File not found: ${fullPath}`);
  }
});

console.log('Quote fixing completed!');