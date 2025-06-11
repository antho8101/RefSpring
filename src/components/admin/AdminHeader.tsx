
import { Shield, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface AdminHeaderProps {
  currentEmail: string;
  adminEmail: string;
}

export const AdminHeader = ({ currentEmail, adminEmail }: AdminHeaderProps) => {
  return (
    <>
      {/* Header Admin */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-red-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Monitoring Système</h1>
              <p className="text-sm text-gray-600">RefSpring - Dashboard Administrateur</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Connecté en tant qu'admin</p>
            <p className="text-sm font-medium text-gray-900">{currentEmail}</p>
          </div>
        </div>
      </div>

      {/* Alerte de sécurité */}
      <Card className="mb-6 border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-800">
              <strong>Zone Administrateur :</strong> Monitoring système - Accès limité à {adminEmail}
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
