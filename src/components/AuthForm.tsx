
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Chrome, Mail, Lock } from 'lucide-react';
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-600">{t('auth.title')}</CardTitle>
          <CardDescription>
            {isLogin ? t('auth.loginDescription') : t('auth.signupDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            onClick={handleGoogleSign}
            disabled={loading}
            className="w-full"
          >
            <Chrome className="mr-2 h-4 w-4" />
            {t('auth.continueWithGoogle')}
          </Button>

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-sm text-muted-foreground">
              {t('auth.or')}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.emailPlaceholder')}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.passwordPlaceholder')}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('auth.loading') : (isLogin ? t('auth.signIn') : t('auth.signUp'))}
            </Button>
          </form>

          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm"
            >
              {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
