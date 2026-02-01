import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useClicker } from '@/hooks/useClicker';
import { useAuth } from '@/contexts/AuthContext';
import { MousePointer2, Zap, Cloud, Globe, ExternalLink, LogOut, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const Index = () => {
  const { days, addDay, loading, subdomain, maxReached } = useClicker();
  const { user, signOut, loading: authLoading } = useAuth();

  const progress = (days / 100) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MousePointer2 className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">HostClick</span>
          </div>
          <div className="flex items-center gap-3">
            {authLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : user ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:block">
                  {user.email}
                </span>
                <Button variant="outline" size="sm" onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Log In</Button>
                </Link>
                <Link to="/signup">
                  <Button>Sign Up</Button>
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
            Free WordPress Hosting
          </h1>
          <p className="text-lg text-muted-foreground">
            Click to earn free hosting days. Each click adds one day to your WordPress hosting plan. Simple, fast, and completely free.
          </p>
        </div>

        {/* Clicker Card */}
        <Card className="max-w-sm mx-auto mb-8 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Your Hosting Status</CardTitle>
            <CardDescription>
              {user ? `Your subdomain: ${subdomain}.hostclick.am` : 'Sign up to claim your subdomain'}
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
                  <p className="text-muted-foreground mb-2">Active for</p>
                  <p className="text-6xl font-bold text-primary">{days}</p>
                  <p className="text-muted-foreground mt-2">
                    {days === 1 ? 'day' : 'days'} / 100 max
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
                  {maxReached ? 'Max Days Reached!' : 'Add 1 Day'}
                </Button>

                <p className="text-sm text-muted-foreground">
                  {maxReached 
                    ? 'You have reached the maximum of 100 days'
                    : 'Each click adds one day of WordPress hosting'}
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
                      Go to Website
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
              Sign up to save your clicks and get your own subdomain!
            </p>
            <Link to="/signup">
              <Button size="lg">
                Get Your Subdomain
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
            <h3 className="font-semibold mb-2">Click to Earn</h3>
            <p className="text-muted-foreground text-sm">
              Each click adds one day of free hosting to your account
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Cloud className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">WordPress Ready</h3>
            <p className="text-muted-foreground text-sm">
              Optimized hosting for WordPress sites with one-click install
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Your Subdomain</h3>
            <p className="text-muted-foreground text-sm">
              Get your own subdomain like yoursite.hostclick.am
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-6 py-8 text-center text-muted-foreground text-sm">
          <p>© 2026 HostClick. Free WordPress hosting for everyone.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
