import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useClicker } from '@/hooks/useClicker';
import { useAuth } from '@/contexts/AuthContext';
import { MousePointer2, Zap, Cloud, Globe, ExternalLink, LogOut, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { SEOHead } from '@/components/SEOHead';

const Index = () => {
  const { t } = useTranslation();
  const { days, addDay, loading, subdomain, maxReached } = useClicker();
  const { user, signOut, loading: authLoading } = useAuth();

  const progress = (days / 100) * 100;

  return (
    <>
      <SEOHead />
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MousePointer2 className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">HostClick</span>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              {authLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : user ? (
                <>
                  <span className="text-sm text-muted-foreground hidden sm:block">
                    {user.email}
                  </span>
                  <Button variant="outline" size="sm" onClick={signOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    {t('nav.logout')}
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost">{t('nav.login')}</Button>
                  </Link>
                  <Link to="/signup">
                    <Button>{t('nav.signup')}</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-6 py-12">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t('landing.title')}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t('landing.subtitle')}
            </p>
          </div>

          {/* Clicker Card */}
          <Card className="max-w-sm mx-auto mb-8 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{t('dashboard.hostingStatus')}</CardTitle>
              <CardDescription>
                {user ? `${subdomain}.hostclick.am` : t('landing.feature1Desc')}
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
                  {user && subdomain && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      asChild
                    >
                      <a 
                        href={`https://${subdomain}.hostclick.am`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        {t('dashboard.goToWebsite')}
                      </a>
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Sign up CTA for non-authenticated users */}
          {!user && !authLoading && (
            <div className="text-center mb-16">
              <p className="text-muted-foreground mb-4">
                {t('auth.signupSubtitle')}
              </p>
              <Link to="/signup">
                <Button size="lg">
                  {t('landing.getStarted')}
                </Button>
              </Link>
            </div>
          )}

          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MousePointer2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{t('landing.feature3Title')}</h3>
              <p className="text-muted-foreground text-sm">
                {t('landing.feature3Desc')}
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Cloud className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{t('landing.feature2Title')}</h3>
              <p className="text-muted-foreground text-sm">
                {t('landing.feature2Desc')}
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{t('landing.feature1Title')}</h3>
              <p className="text-muted-foreground text-sm">
                {t('landing.feature1Desc')}
              </p>
            </div>
          </div>
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

export default Index;
