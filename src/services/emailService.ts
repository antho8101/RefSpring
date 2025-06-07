
import emailjs from '@emailjs/browser';

// Configuration EmailJS avec vos vraies clés API
const EMAILJS_SERVICE_ID = 'service_5bbcvon';
const EMAILJS_TEMPLATE_ID = 'template_ssdwvt4';
const EMAILJS_PUBLIC_KEY = 'PL2a6c90I4enuUbE7';
const EMAILJS_PRIVATE_KEY = 'cLzY1cODYI2SjP7KlLv85';

// Initialisation EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

// Test de la connexion EmailJS au démarrage
console.log('🔧 Initialisation du service EmailJS...');
console.log('🔑 Clé publique configurée:', EMAILJS_PUBLIC_KEY);

export interface AffiliateCommissionEmail {
  affiliateEmail: string;
  affiliateName: string;
  amount: number;
  campaignName: string;
  paymentLinkUrl: string;
}

// Template HTML pour l'email de commission RefSpring (en anglais)
const getCommissionEmailTemplate = (data: AffiliateCommissionEmail): string => {
  return `
<div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    
    <!-- Header avec branding RefSpring -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center;">
      <div style="font-size: 28px; font-weight: bold; margin-bottom: 8px;">RefSpring</div>
      <div style="font-size: 16px; opacity: 0.9;">Commission Payment Ready! 💰</div>
    </div>
    
    <!-- Contenu principal -->
    <div style="padding: 40px 30px;">
      <div style="font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #1a202c;">
        Hello ${data.affiliateName}! 👋
      </div>
      
      <div style="font-size: 16px; margin-bottom: 30px; color: #4a5568; line-height: 1.6;">
        Great news! Your commission for the <strong>${data.campaignName}</strong> campaign is ready to be collected.
        We've generated a secure payment link just for you.
      </div>
      
      <!-- Commission amount highlight -->
      <div style="background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); border: 2px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
        <div style="font-size: 36px; font-weight: bold; color: #2d3748; margin-bottom: 8px;">
          €${data.amount.toFixed(2)}
        </div>
        <div style="font-size: 14px; color: #718096; text-transform: uppercase; letter-spacing: 0.5px;">
          Commission Amount
        </div>
      </div>
      
      <!-- Call to Action Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.paymentLinkUrl}" 
           style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; transition: transform 0.2s;"
           target="_blank" rel="noopener">
          💳 Get My Commission!
        </a>
      </div>
      
      <!-- Security notice -->
      <div style="background: #fef5e7; border: 1px solid #fbd38d; border-radius: 6px; padding: 15px; margin: 25px 0; font-size: 14px; color: #744210;">
        <strong>🔒 Secured by Stripe</strong><br>
        This payment link is secure and powered by Stripe, the world's leading payment processor.
        Your banking information is protected according to PCI DSS standards.
      </div>
      
      <div style="font-size: 16px; margin-bottom: 30px; color: #4a5568; line-height: 1.6;">
        <strong>Important:</strong> This payment link is personal and should not be shared.
        It will automatically expire after use or in 30 days for security reasons.
      </div>
      
      <div style="font-size: 14px; color: #718096; margin-top: 30px;">
        Thanks for being an amazing affiliate partner! 🚀<br>
        <strong>The RefSpring Team</strong>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background: #f7fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
      <div style="font-size: 14px; color: #718096; margin-bottom: 10px;">
        This email was sent automatically by RefSpring
      </div>
      <div style="font-size: 14px; color: #718096;">
        Questions? Contact us at <a href="mailto:support@refspring.com" style="color: #667eea; text-decoration: none;">support@refspring.com</a>
      </div>
    </div>
    
  </div>
</div>
`;
};

// Service principal pour envoyer les emails de commission avec EmailJS
export class EmailService {
  static async sendCommissionEmail(data: AffiliateCommissionEmail): Promise<boolean> {
    try {
      console.log('📧 DÉBUT sendCommissionEmail - Données reçues:', data);
      console.log('📧 Email destinataire:', data.affiliateEmail);
      console.log('📧 Montant commission:', data.amount);
      console.log('📧 Nom campagne:', data.campaignName);
      
      console.log('🚀 Tentative d\'envoi via EmailJS...');
      console.log('🔗 Service EmailJS configuré:', EMAILJS_SERVICE_ID);
      console.log('🔗 Template EmailJS configuré:', EMAILJS_TEMPLATE_ID);
      
      // Préparer les paramètres pour EmailJS
      const templateParams = {
        to_email: data.affiliateEmail,
        to_name: data.affiliateName,
        from_name: 'RefSpring',
        subject: `💰 Your €${data.amount.toFixed(2)} commission is ready!`,
        affiliate_name: data.affiliateName,
        commission_amount: data.amount.toFixed(2),
        campaign_name: data.campaignName,
        payment_link_url: data.paymentLinkUrl,
        html_content: getCommissionEmailTemplate(data)
      };
      
      console.log('📦 Paramètres template préparés:', {
        to_email: templateParams.to_email,
        to_name: templateParams.to_name,
        subject: templateParams.subject,
        commission_amount: templateParams.commission_amount,
        campaign_name: templateParams.campaign_name
      });

      console.log('⏰ Appel emailjs.send() en cours...');
      const startTime = Date.now();
      
      const result = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );
      
      const endTime = Date.now();
      console.log(`⏱️ Durée de l'appel EmailJS: ${endTime - startTime}ms`);
      
      console.log('📬 Réponse complète d\'EmailJS:', result);
      console.log('📬 Status:', result.status);
      console.log('📬 Text:', result.text);
      
      if (result.status === 200) {
        console.log('✅ Email envoyé avec succès via EmailJS!');
        return true;
      } else {
        console.error('❌ Erreur EmailJS - Status non-200:', result.status);
        return false;
      }
    } catch (error) {
      console.error('❌ ERREUR CRITIQUE dans sendCommissionEmail (EmailJS):');
      console.error('❌ Type erreur:', typeof error);
      console.error('❌ Erreur complète:', error);
      console.error('❌ Message:', error?.message || 'Pas de message');
      console.error('❌ Stack:', error?.stack || 'Pas de stack');
      
      if (error?.status) {
        console.error('❌ Status EmailJS:', error.status);
      }
      if (error?.text) {
        console.error('❌ Text EmailJS:', error.text);
      }
      
      return false;
    }
  }

  // Méthode pour envoyer plusieurs emails avec gestion des erreurs
  static async sendBulkCommissionEmails(commissions: AffiliateCommissionEmail[]): Promise<{
    successful: number;
    failed: number;
    errors: string[];
  }> {
    console.log(`📧 Envoi groupé de ${commissions.length} emails de commission via EmailJS`);
    
    let successful = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const commission of commissions) {
      try {
        const success = await this.sendCommissionEmail(commission);
        if (success) {
          successful++;
        } else {
          failed++;
          errors.push(`Échec envoi à ${commission.affiliateEmail}`);
        }
        
        // Délai pour éviter le rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        failed++;
        errors.push(`Erreur pour ${commission.affiliateEmail}: ${error.message}`);
      }
    }

    console.log(`✅ Envoi groupé terminé: ${successful} succès, ${failed} échecs`);
    return { successful, failed, errors };
  }
}

export const emailService = new EmailService();
