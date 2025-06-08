
import { Button } from '@/components/ui/button';
import { EmailSettings } from '@/components/EmailSettings';

interface AccountSettingsProps {
  onCancel: () => void;
}

export const AccountSettings = ({ onCancel }: AccountSettingsProps) => {
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h4 className="text-lg font-medium text-slate-900">Adresse email</h4>
        <p className="text-sm text-slate-600">Modifiez votre adresse email</p>
      </div>
      
      <EmailSettings />

      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel}>
          Fermer
        </Button>
      </div>
    </div>
  );
};
