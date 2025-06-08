
import jsPDF from 'jspdf';
import { BillingRecord } from '@/types';

export const generateInvoicePDF = async (record: BillingRecord, userEmail: string) => {
  const pdf = new jsPDF();
  
  // Configuration
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = 30;
  
  // En-tête RefSpring
  pdf.setFontSize(24);
  pdf.setTextColor(59, 130, 246); // blue-500
  pdf.text('RefSpring', margin, yPosition);
  
  pdf.setFontSize(12);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Plateforme d\'affiliation', margin, yPosition + 8);
  
  // Informations facture
  yPosition += 30;
  pdf.setFontSize(18);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Facture de commission', margin, yPosition);
  
  yPosition += 20;
  pdf.setFontSize(12);
  pdf.text(`Numéro: ${record.id}`, margin, yPosition);
  yPosition += 8;
  pdf.text(`Période: ${formatPeriodForPDF(record.period)}`, margin, yPosition);
  yPosition += 8;
  pdf.text(`Date d'émission: ${new Date().toLocaleDateString('fr-FR')}`, margin, yPosition);
  yPosition += 8;
  pdf.text(`Client: ${userEmail}`, margin, yPosition);
  
  // Ligne de séparation
  yPosition += 20;
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  
  // Détails de facturation
  yPosition += 20;
  pdf.setFontSize(14);
  pdf.setTextColor(0, 0, 0);
  pdf.text('Détail des commissions', margin, yPosition);
  
  yPosition += 15;
  pdf.setFontSize(11);
  
  // Tableau des détails
  const tableData = [
    ['Description', 'Montant', 'Pourcentage'],
    ['Chiffre d\'affaires total', `${record.totalRevenue.toFixed(2)} €`, '100%'],
    ['Commissions affiliés', `${record.commissionAmount.toFixed(2)} €`, `${((record.commissionAmount / record.totalRevenue) * 100).toFixed(1)}%`],
    ['Commission RefSpring (2,5%)', `${record.feeAmount.toFixed(2)} €`, '2,5%']
  ];
  
  // En-têtes du tableau
  pdf.setFillColor(248, 250, 252); // gray-50
  pdf.rect(margin, yPosition, pageWidth - 2 * margin, 12, 'F');
  
  pdf.setTextColor(0, 0, 0);
  pdf.text('Description', margin + 5, yPosition + 8);
  pdf.text('Montant', margin + 120, yPosition + 8);
  pdf.text('Pourcentage', margin + 160, yPosition + 8);
  
  yPosition += 12;
  
  // Lignes du tableau
  for (let i = 1; i < tableData.length; i++) {
    const row = tableData[i];
    
    if (i === tableData.length - 1) {
      // Dernière ligne en gras (commission RefSpring)
      pdf.setFont(undefined, 'bold');
      pdf.setFillColor(239, 246, 255); // blue-50
      pdf.rect(margin, yPosition, pageWidth - 2 * margin, 12, 'F');
    }
    
    pdf.text(row[0], margin + 5, yPosition + 8);
    pdf.text(row[1], margin + 120, yPosition + 8);
    pdf.text(row[2], margin + 160, yPosition + 8);
    
    pdf.setFont(undefined, 'normal');
    yPosition += 12;
  }
  
  // Total
  yPosition += 20;
  pdf.setDrawColor(59, 130, 246);
  pdf.line(margin, yPosition, pageWidth - margin, yPosition);
  
  yPosition += 15;
  pdf.setFontSize(14);
  pdf.setFont(undefined, 'bold');
  pdf.setTextColor(59, 130, 246);
  pdf.text(`Total prélevé: ${(record.commissionAmount + record.feeAmount).toFixed(2)} €`, margin, yPosition);
  
  // Statut du paiement
  yPosition += 20;
  pdf.setFontSize(12);
  pdf.setFont(undefined, 'normal');
  
  const statusText = record.status === 'paid' ? 'PAYÉ' : 
                    record.status === 'pending' ? 'EN ATTENTE' : 'ÉCHEC';
  const statusColor = record.status === 'paid' ? [34, 197, 94] : 
                     record.status === 'pending' ? [234, 179, 8] : [239, 68, 68];
  
  pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  pdf.text(`Statut: ${statusText}`, margin, yPosition);
  
  if (record.processedAt) {
    yPosition += 8;
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Traité le: ${new Date(record.processedAt).toLocaleDateString('fr-FR')}`, margin, yPosition);
  }
  
  // Pied de page
  yPosition = pdf.internal.pageSize.getHeight() - 40;
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text('RefSpring - Plateforme d\'affiliation', margin, yPosition);
  pdf.text('Cette facture est générée automatiquement.', margin, yPosition + 8);
  
  // Télécharger le PDF
  const fileName = `facture-refspring-${record.period}-${record.id.substring(0, 8)}.pdf`;
  pdf.save(fileName);
  
  console.log('✅ Facture PDF générée:', fileName);
};

const formatPeriodForPDF = (period: string): string => {
  const [year, month] = period.split('-');
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
};
