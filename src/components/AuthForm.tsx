
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Chrome, Mail, Lock, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmail(email, password);
        toast({
          title: t('auth.loginSuccess'),
          description: t('auth.welcome'),
        });
      } else {
        await signUpWithEmail(email, password);
        toast({
          title: t('auth.accountCreated'),
          description: t('auth.accountCreatedDesc'),
        });
      }
    } catch (error: any) {
      toast({
        title: t('auth.error'),
        description: error.message || t('auth.genericError'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSign = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast({
        title: t('auth.loginSuccess'),
        description: t('auth.welcome'),
      });
    } catch (error: any) {
      toast({
        title: t('auth.error'),
        description: error.message || t('auth.genericError'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLanding = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 flex items-center justify-center p-4 relative">
      {/* Bouton retour */}
      <Button
        variant="ghost"
        onClick={handleBackToLanding}
        className="absolute top-6 left-6 text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour
      </Button>

      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-xl">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t('auth.title')}
          </CardTitle>
          <CardDescription className="text-slate-600">
            {isLogin ? t('auth.loginDescription') : t('auth.signupDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            variant="outline"
            onClick={handleGoogleSign}
            disabled={loading}
            className="w-full border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <Chrome className="mr-2 h-4 w-4" />
            {t('auth.continueWithGoogle')}
          </Button>

          <div className="relative">
            <Separator className="bg-slate-200" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-sm text-slate-500">
              {t('auth.or')}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">{t('auth.email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.emailPlaceholder')}
                  className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">{t('auth.password')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.passwordPlaceholder')}
                  className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200" 
              disabled={loading}
            >
              {loading ? t('auth.loading') : (isLogin ? t('auth.signIn') : t('auth.signUp'))}
            </Button>
          </form>

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
