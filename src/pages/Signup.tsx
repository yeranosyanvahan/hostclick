import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MousePointer2, ArrowLeft, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { SEOHead } from '@/components/SEOHead';
import { useClicker } from '@/hooks/useClicker';

const STORAGE_KEY = 'hostclick_days';

const Signup = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { signUp, user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    subdomain: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);
  const [checkingSubdomain, setCheckingSubdomain] = useState(false);

  // Get locally stored clicks to transfer on signup
  const storedClicks = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Check subdomain availability
  useEffect(() => {
    const checkSubdomain = async () => {
      if (formData.subdomain.length < 3) {
        setSubdomainAvailable(null);
        return;
      }

      // Validate subdomain format
      const subdomainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
      if (!subdomainRegex.test(formData.subdomain.toLowerCase())) {
        setSubdomainAvailable(false);
        return;
      }

      setCheckingSubdomain(true);
      try {
        const { data, error } = await supabase.rpc('is_subdomain_available', {
          check_subdomain: formData.subdomain.toLowerCase(),
        });

        if (error) throw error;
        setSubdomainAvailable(data);
      } catch (error) {
        console.error('Error checking subdomain:', error);
        setSubdomainAvailable(null);
      } finally {
        setCheckingSubdomain(false);
      }
    };

    const debounce = setTimeout(checkSubdomain, 500);
    return () => clearTimeout(debounce);
  }, [formData.subdomain]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error(t('auth.passwordMismatch'));
      return;
    }

    if (formData.password.length < 6) {
      toast.error(t('auth.passwordMinLength'));
      return;
    }

    if (formData.subdomain.length < 3) {
      toast.error(t('auth.subdomainMinLength'));
      return;
    }

    if (!subdomainAvailable) {
      toast.error(t('auth.subdomainUnavailable'));
      return;
    }

    setIsLoading(true);
    
    // Pass locally stored clicks to be saved with the profile
    const { error } = await signUp(formData.email, formData.password, formData.subdomain, storedClicks);
    
    setIsLoading(false);

    if (error) {
      if (error.message === 'email_registered') {
        toast.error(t('auth.emailRegistered'));
      } else if (error.message === 'subdomain_taken') {
        toast.error(t('auth.subdomainTaken'));
      } else {
        toast.error(error.message);
      }
    } else {
      // Clear local storage after successful signup
      localStorage.removeItem(STORAGE_KEY);
      toast.success(t('auth.checkEmail'));
      navigate('/login');
    }
  };

  return (
    <>
      <SEOHead 
        title={t('auth.signupTitle')}
        description="Create your free HostClick account and get your own WordPress subdomain."
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
            <CardTitle className="text-2xl">{t('auth.signupTitle')}</CardTitle>
            <CardDescription>
              {t('auth.signupSubtitle')}
            </CardDescription>
            {storedClicks > 0 && (
              <p className="text-sm text-primary mt-2">
                ✨ {storedClicks} {storedClicks === 1 ? t('dashboard.day') : t('dashboard.days')} will be saved to your account!
              </p>
            )}
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subdomain">{t('auth.subdomain')}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="subdomain"
                    name="subdomain"
                    type="text"
                    placeholder={t('auth.subdomainPlaceholder')}
                    value={formData.subdomain}
                    onChange={handleInputChange}
                    required
                    className="flex-1"
                  />
                  <span className="text-muted-foreground whitespace-nowrap">{t('auth.subdomainSuffix')}</span>
                  {checkingSubdomain && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  {!checkingSubdomain && subdomainAvailable === true && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                  {!checkingSubdomain && subdomainAvailable === false && (
                    <X className="h-4 w-4 text-destructive" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formData.subdomain.length >= 3 && subdomainAvailable === false
                    ? t('auth.subdomainTaken')
                    : t('auth.subdomainHint')}
                </p>
              </div>

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
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('common.confirmPassword')}</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder={t('auth.passwordPlaceholder')}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !subdomainAvailable}
              >
                {isLoading ? t('auth.creatingAccount') : t('nav.signup')}
              </Button>

              <p className="text-sm text-muted-foreground">
                {t('auth.hasAccount')}{' '}
                <Link to="/login" className="text-primary hover:underline">
                  {t('nav.login')}
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

export default Signup;
