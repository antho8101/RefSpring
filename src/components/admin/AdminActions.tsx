
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AdminActionsProps {
  onRunHealthChecks: () => void;
  isChecking: boolean;
}

export const AdminActions = ({ onRunHealthChecks, isChecking }: AdminActionsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions Système</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 flex-wrap">
          <Button 
            variant="outline" 
            onClick={() => window.open('https://console.firebase.google.com', '_blank')}
          >
            Console Firebase
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.open('https://vercel.com/dashboard', '_blank')}
          >
            Dashboard Vercel
          </Button>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/status'}
          >
            Page Statut Public
          </Button>
          <Button 
            variant="outline" 
            onClick={onRunHealthChecks}
            disabled={isChecking}
          >
            Forcer Diagnostic Complet
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
