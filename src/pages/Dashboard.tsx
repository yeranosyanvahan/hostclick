import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useClicker } from '@/hooks/useClicker';
import { useAuth } from '@/contexts/AuthContext';
import { MousePointer2, Zap, ExternalLink, LogOut, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { SEOHead } from '@/components/SEOHead';

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { days, addDay, loading, subdomain, maxReached } = useClicker();
  const { user, signOut, loading: authLoading } = useAuth();

  const progress = (days / 100) * 100;

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title={t('dashboard.title')}
        description="Manage your WordPress hosting and earn more days."
        noIndex
      />
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MousePointer2 className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">HostClick</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden sm:block">
                {user?.email}
              </span>
              <LanguageSwitcher />
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                {t('nav.logout')}
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-12">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{t('dashboard.title')}</h1>
            <p className="text-muted-foreground">
              {t('dashboard.subtitle')}
            </p>
          </div>

          {/* Clicker Card */}
          <Card className="max-w-md mx-auto shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{t('dashboard.hostingStatus')}</CardTitle>
              <CardDescription>
                {subdomain ? `${subdomain}.hostclick.am` : t('common.loading')}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              {loading ? (
                <div className="py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                </div>
              ) : (
                <>
                  <div className="py-4">
                    <p className="text-muted-foreground mb-2">{t('dashboard.activeFor')}</p>
                    <p className="text-6xl font-bold text-primary">{days}</p>
                    <p className="text-muted-foreground mt-2">
                      {days === 1 ? t('dashboard.day') : t('dashboard.days')} {t('dashboard.maxDays')}
                    </p>
                  </div>

                  <Progress value={progress} className="h-2" />

                  <Button 
                    onClick={addDay} 
                    size="lg" 
                    className="w-full text-lg py-6 rounded-full font-semibold shadow-md hover:shadow-lg transition-shadow"
                    disabled={maxReached}
                  >
                    <Zap className="mr-2 h-5 w-5" />
                    {maxReached ? t('dashboard.maxReached') : t('dashboard.addDay')}
                  </Button>

                  <p className="text-sm text-muted-foreground">
                    {maxReached 
                      ? t('dashboard.maxReachedDesc')
                      : t('dashboard.clickHint')}
                  </p>

                  {/* Go to Website Button */}
                  {subdomain && (
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="w-full"
                      asChild
                    >
                      <a 
                        href={`https://${subdomain}.hostclick.am`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-2 h-5 w-5" />
                        {t('dashboard.goToWebsite')}
                      </a>
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </main>

        {/* Footer */}
        <footer className="border-t border-border mt-16">
          <div className="container mx-auto px-6 py-8 text-center text-muted-foreground text-sm">
            <p>{t('footer.copyright')}</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Dashboard;
