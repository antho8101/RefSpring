
import { Button } from '@/components/ui/button';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { useState } from 'react';
import { CookiePreferencesDialog } from '@/components/CookiePreferencesDialog';

export const GDPRFooter = () => {
  const { hasConsented } = useCookieConsent();
  const [showPreferences, setShowPreferences] = useState(false);

  if (!hasConsented) return null;

  return (
    <>
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
              <Link to="/privacy" className="hover:text-slate-900">
                Politique de confidentialité
              </Link>
              <Link to="/legal" className="hover:text-slate-900">
                Mentions légales
              </Link>
              <button 
                onClick={() => setShowPreferences(true)}
                className="hover:text-slate-900 flex items-center gap-1"
              >
                <Settings className="h-3 w-3" />
                Préférences cookies
              </button>
            </div>
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} RefSpring. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>

      <CookiePreferencesDialog 
        open={showPreferences} 
        onOpenChange={setShowPreferences} 
      />
    </>
  );
};
