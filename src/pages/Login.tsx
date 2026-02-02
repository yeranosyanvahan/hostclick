import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MousePointer2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { SEOHead } from '@/components/SEOHead';

const Login = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { signIn, user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    const { error } = await signIn(formData.email, formData.password);
    
    setIsLoading(false);

    if (error) {
      if (error.message === 'invalid_credentials') {
        toast.error(t('auth.invalidCredentials'));
      } else if (error.message === 'email_not_confirmed') {
        toast.error(t('auth.checkEmail'));
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success(t('auth.loginTitle'));
      navigate('/dashboard');
    }
  };

  return (
    <>
      <SEOHead 
        title={t('auth.loginTitle')}
        description="Log in to your HostClick account to manage your WordPress hosting."
      />
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <MousePointer2 className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">HostClick</span>
            </div>
            <CardTitle className="text-2xl">{t('auth.loginTitle')}</CardTitle>
            <CardDescription>
              {t('auth.loginSubtitle')}
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t('common.email')}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t('auth.emailPlaceholder')}
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">{t('common.password')}</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder={t('auth.passwordPlaceholder')}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t('auth.loggingIn') : t('nav.login')}
              </Button>

              <p className="text-sm text-muted-foreground">
                {t('auth.noAccount')}{' '}
                <Link to="/signup" className="text-primary hover:underline">
                  {t('nav.signup')}
                </Link>
              </p>
              
              <Link 
                to="/" 
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('auth.backToHome')}
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
    </>
  );
};

export default Login;
