
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Calendar, Euro, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BillingRecord } from '@/types';
import { useCurrencyConverter } from '@/hooks/useCurrencyConverter';
import { generateInvoicePDF } from '@/utils/invoiceGenerator';

interface BillingHistorySettingsProps {
  onCancel: () => void;
}

export const BillingHistorySettings = ({ onCancel }: BillingHistorySettingsProps) => {
  const { user } = useAuth();
  const { convertAndFormat } = useCurrencyConverter();
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      loadBillingHistory();
    }
  }, [user?.uid]);

  const loadBillingHistory = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      console.log('📊 Chargement historique facturation pour:', user.uid);
      
      const billingQuery = query(
        collection(db, 'billingRecords'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const billingSnapshot = await getDocs(billingQuery);
      const records: BillingRecord[] = billingSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        processedAt: doc.data().processedAt?.toDate() || null,
      })) as BillingRecord[];
      
      setBillingRecords(records);
      console.log('✅ Historique facturation chargé:', records.length, 'enregistrements');
    } catch (error) {
      console.error('❌ Erreur chargement historique:', error);
      setBillingRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async (record: BillingRecord) => {
    try {
      console.log('📄 Génération facture PDF pour:', record.id);
      await generateInvoicePDF(record, user?.email || '');
    } catch (error) {
      console.error('❌ Erreur génération PDF:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Payé</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">En attente</span>;
      case 'failed':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Échec</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{status}</span>;
    }
  };

  const formatPeriod = (period: string) => {
    // Format YYYY-MM vers "Mois YYYY"
    const [year, month] = period.split('-');
    const monthNames = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h4 className="text-lg font-medium text-slate-900">Historique de facturation</h4>
        <p className="text-sm text-slate-600">
          Consultez vos prélèvements mensuels et téléchargez vos factures
        </p>
      </div>

      {/* Informations sur la facturation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Cycle de facturation
          </CardTitle>
          <CardDescription>
            Les prélèvements sont effectués automatiquement le 5 de chaque mois pour les commissions du mois précédent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-blue-600 mb-1">
                <Euro className="h-4 w-4" />
                <span className="text-sm font-medium">Commission RefSpring</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">2,5%</p>
              <p className="text-xs text-blue-600">du chiffre d'affaires total</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">Commissions affiliés</span>
              </div>
              <p className="text-2xl font-bold text-green-900">Variable</p>
              <p className="text-xs text-green-600">selon taux configuré</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-purple-600 mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Prélèvement</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">5</p>
              <p className="text-xs text-purple-600">de chaque mois</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des factures */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des prélèvements</CardTitle>
          <CardDescription>
            Vos factures mensuelles et détails des prélèvements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-slate-600">Chargement de l'historique...</p>
            </div>
          ) : billingRecords.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune facture disponible</h3>
              <p className="text-gray-600">
                Votre premier prélèvement aura lieu le 5 du mois suivant vos premières conversions.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Période</TableHead>
                  <TableHead>CA Total</TableHead>
                  <TableHead>Commissions Affiliés</TableHead>
                  <TableHead>Commission RefSpring</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date traitement</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billingRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {formatPeriod(record.period)}
                    </TableCell>
                    <TableCell>
                      {convertAndFormat(record.totalRevenue)}
                    </TableCell>
                    <TableCell>
                      {convertAndFormat(record.commissionAmount)}
                    </TableCell>
                    <TableCell>
                      {convertAndFormat(record.feeAmount)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(record.status)}
                    </TableCell>
                    <TableCell>
                      {record.processedAt 
                        ? new Date(record.processedAt).toLocaleDateString('fr-FR')
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadInvoice(record)}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

    </div>
  );
};
