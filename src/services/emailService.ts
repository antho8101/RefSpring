
import { Resend } from 'resend';

// Configuration Resend avec votre clé API
const resend = new Resend('re_gUoVo8NG_4axGbH6WaWbgF1nBmP85EBrD');

// Test de la connexion Resend au démarrage
console.log('🔧 Initialisation du service Resend...');
console.log('🔑 Clé API configurée:', 're_gUoVo8NG_4axGbH6WaWbgF1nBmP85EBrD');

export interface AffiliateCommissionEmail {
  affiliateEmail: string;
  affiliateName: string;
  amount: number;
  campaignName: string;
  paymentLinkUrl: string;
}

// Template HTML pour l'email de commission
const getCommissionEmailTemplate = (data: AffiliateCommissionEmail): string => {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Votre commission RefSpring</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .logo {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .subtitle {
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
            color: #1a202c;
        }
        .message {
            font-size: 16px;
            margin-bottom: 30px;
            color: #4a5568;
        }
        .commission-box {
            background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
            text-align: center;
        }
        .commission-amount {
            font-size: 36px;
            font-weight: bold;
            color: #2d3748;
            margin-bottom: 8px;
        }
        .commission-label {
            font-size: 14px;
            color: #718096;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .campaign-info {
            background: #f7fafc;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 25px 0;
            border-radius: 0 8px 8px 0;
        }
        .campaign-name {
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 5px;
        }
        .campaign-label {
            font-size: 14px;
            color: #718096;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            transition: transform 0.2s;
            margin: 20px 0;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .footer {
            background: #f7fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .footer-text {
            font-size: 14px;
            color: #718096;
            margin-bottom: 10px;
        }
        .footer-link {
            color: #667eea;
            text-decoration: none;
        }
        .security-note {
            background: #fef5e7;
            border: 1px solid #fbd38d;
            border-radius: 6px;
            padding: 15px;
            margin: 25px 0;
            font-size: 14px;
            color: #744210;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">RefSpring</div>
            <div class="subtitle">Votre commission est prête !</div>
        </div>
        
        <div class="content">
            <div class="greeting">Bonjour ${data.affiliateName} 👋</div>
            
            <div class="message">
                Félicitations ! Votre commission pour la campagne est maintenant disponible.
                Cliquez sur le bouton ci-dessous pour recevoir votre paiement via Stripe.
            </div>
            
            <div class="commission-box">
                <div class="commission-amount">${data.amount.toFixed(2)}€</div>
                <div class="commission-label">Commission à recevoir</div>
            </div>
            
            <div class="campaign-info">
                <div class="campaign-label">Campagne</div>
                <div class="campaign-name">${data.campaignName}</div>
            </div>
            
            <div style="text-align: center;">
                <a href="${data.paymentLinkUrl}" class="cta-button">
                    💳 Recevoir ma commission
                </a>
            </div>
            
            <div class="security-note">
                <strong>🔒 Sécurisé par Stripe</strong><br>
                Ce lien de paiement est sécurisé et géré par Stripe, leader mondial des paiements en ligne.
                Vos données bancaires sont protégées selon les standards PCI DSS.
            </div>
            
            <div class="message">
                <strong>Important :</strong> Ce lien de paiement est personnel et ne doit pas être partagé.
                Il expire automatiquement après utilisation ou dans 30 jours.
            </div>
        </div>
        
        <div class="footer">
            <div class="footer-text">
                Cet email a été envoyé automatiquement par RefSpring
            </div>
            <div class="footer-text">
                Questions ? Contactez-nous à <a href="mailto:support@refspring.com" class="footer-link">support@refspring.com</a>
            </div>
        </div>
    </div>
</body>
</html>
`;
};

// Service principal pour envoyer les emails de commission
export class EmailService {
  static async sendCommissionEmail(data: AffiliateCommissionEmail): Promise<boolean> {
    try {
      console.log('📧 DÉBUT sendCommissionEmail - Données reçues:', data);
      console.log('📧 Email destinataire:', data.affiliateEmail);
      console.log('📧 Montant commission:', data.amount);
      console.log('📧 Nom campagne:', data.campaignName);
      
      console.log('🚀 Tentative d\'envoi via Resend...');
      console.log('🔗 URL du service Resend:', 'https://api.resend.com/emails');
      
      const emailPayload = {
        from: 'RefSpring <commissions@refspring.com>',
        to: [data.affiliateEmail],
        subject: `💰 Votre commission de ${data.amount.toFixed(2)}€ est prête !`,
        html: getCommissionEmailTemplate(data),
      };
      
      console.log('📦 Payload email préparé:', {
        from: emailPayload.from,
        to: emailPayload.to,
        subject: emailPayload.subject,
        htmlLength: emailPayload.html.length
      });

      console.log('⏰ Appel resend.emails.send() en cours...');
      const startTime = Date.now();
      
      const emailData = await resend.emails.send(emailPayload);
      
      const endTime = Date.now();
      console.log(`⏱️ Durée de l'appel Resend: ${endTime - startTime}ms`);
      
      console.log('📬 Réponse complète de Resend:', emailData);
      console.log('📬 Réponse data:', emailData.data);
      console.log('📬 Réponse error:', emailData.error);
      
      if (emailData.error) {
        console.error('❌ Erreur Resend détectée:', emailData.error);
        return false;
      }

      console.log('✅ Email envoyé avec succès! ID:', emailData.data?.id || 'pas d\'ID');
      return true;
    } catch (error) {
      console.error('❌ ERREUR CRITIQUE dans sendCommissionEmail:');
      console.error('❌ Type erreur:', typeof error);
      console.error('❌ Erreur complète:', error);
      console.error('❌ Message:', error?.message || 'Pas de message');
      console.error('❌ Stack:', error?.stack || 'Pas de stack');
      
      if (error?.response) {
        console.error('❌ Réponse HTTP:', error.response);
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
    console.log(`📧 Envoi groupé de ${commissions.length} emails de commission`);
    
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
        await new Promise(resolve => setTimeout(resolve, 200));
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
