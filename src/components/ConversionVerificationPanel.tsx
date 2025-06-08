
import { useState, useEffect } from 'react';
import { Conversion } from '@/types';
import { useConversionVerification } from '@/hooks/useConversionVerification';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, AlertTriangle, Clock, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface ConversionVerificationPanelProps {
  campaignId?: string;
  isAdmin?: boolean;
}

export const ConversionVerificationPanel = ({ campaignId, isAdmin = false }: ConversionVerificationPanelProps) => {
  const [pendingConversions, setPendingConversions] = useState<Conversion[]>([]);
  const [selectedConversion, setSelectedConversion] = useState<Conversion | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [loading, setLoading] = useState(true);

  const { verifyConversion, getPendingConversions } = useConversionVerification();

  useEffect(() => {
    loadPendingConversions();
  }, [campaignId]);

  const loadPendingConversions = async () => {
    try {
      setLoading(true);
      const conversions = await getPendingConversions(campaignId);
      setPendingConversions(conversions);
    } catch (error) {
      console.error('Erreur chargement conversions:', error);
      toast.error('Erreur lors du chargement des conversions');
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (conversionId: string, action: 'verify' | 'reject') => {
    if (!isAdmin) {
      toast.error('Accès non autorisé');
      return;
    }

    try {
      await verifyConversion(conversionId, action, 'admin-user', verificationNotes);
      toast.success(`Conversion ${action === 'verify' ? 'approuvée' : 'rejetée'}`);
      setVerificationNotes('');
      setSelectedConversion(null);
      await loadPendingConversions();
    } catch (error) {
      toast.error('Erreur lors de la vérification');
    }
  };

  const getStatusBadge = (status: string, riskScore?: number) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600"><Clock className="w-3 h-3 mr-1" />En attente</Badge>;
      case 'suspicious':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Suspect ({riskScore}%)</Badge>;
      case 'verified':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Vérifié</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejeté</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount / 100);
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Conversions en cours de vérification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            {pendingConversions.length} conversion(s) en attente de vérification
          </p>
          {pendingConversions.length > 0 && (
            <div className="text-sm text-gray-500">
              Vos conversions sont en cours de vérification. Vous serez notifié dès qu'elles seront approuvées.
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Panel de vérification des conversions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : pendingConversions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucune conversion en attente de vérification
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingConversions.map((conversion) => (
                  <TableRow key={conversion.id}>
                    <TableCell>
                      {conversion.timestamp.toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell>{formatAmount(conversion.amount)}</TableCell>
                    <TableCell>{formatAmount(conversion.commission)}</TableCell>
                    <TableCell>{getStatusBadge(conversion.status, conversion.riskScore)}</TableCell>
                    <TableCell>
                      <span className={`font-medium ${
                        (conversion.riskScore || 0) > 70 ? 'text-red-600' :
                        (conversion.riskScore || 0) > 40 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {conversion.riskScore || 0}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedConversion(conversion)}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleVerification(conversion.id, 'verify')}
                        >
                          <CheckCircle className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleVerification(conversion.id, 'reject')}
                        >
                          <XCircle className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedConversion && (
        <Card>
          <CardHeader>
            <CardTitle>Détails de la conversion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">ID Conversion</label>
                <p className="text-sm text-gray-600">{selectedConversion.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Affilié</label>
                <p className="text-sm text-gray-600">{selectedConversion.affiliateId}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Montant</label>
                <p className="text-sm text-gray-600">{formatAmount(selectedConversion.amount)}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Commission</label>
                <p className="text-sm text-gray-600">{formatAmount(selectedConversion.commission)}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Notes de vérification</label>
              <Textarea
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder="Ajoutez des notes pour cette vérification..."
                className="mt-1"
              />
            </div>

            <div className="flex gap-3">
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleVerification(selectedConversion.id, 'verify')}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approuver
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleVerification(selectedConversion.id, 'reject')}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Rejeter
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedConversion(null)}
              >
                Fermer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
