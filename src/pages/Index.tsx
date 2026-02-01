import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useClicker } from '@/hooks/useClicker';
import { MousePointer2, Zap, Cloud, Globe } from 'lucide-react';

const Index = () => {
  const { days, addDay } = useClicker();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MousePointer2 className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">HostClick</span>
          </div>
          <Link to="/signup">
            <Button variant="outline">Sign Up</Button>
          </Link>
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
        <Card className="max-w-sm mx-auto mb-16 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Your Hosting Status</CardTitle>
            <CardDescription>Keep clicking to extend your hosting</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="py-4">
              <p className="text-muted-foreground mb-2">Active for</p>
              <p className="text-6xl font-bold text-primary">{days}</p>
              <p className="text-muted-foreground mt-2">
                {days === 1 ? 'day' : 'days'}
              </p>
            </div>

            <Button 
              onClick={addDay} 
              size="lg" 
              className="w-full text-lg py-6 rounded-full font-semibold shadow-md hover:shadow-lg transition-shadow"
            >
              <Zap className="mr-2 h-5 w-5" />
              Add 1 Day
            </Button>

            <p className="text-sm text-muted-foreground">
              Each click adds one day of WordPress hosting
            </p>
          </CardContent>
        </Card>

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
            <h3 className="font-semibold mb-2">Always Free</h3>
            <p className="text-muted-foreground text-sm">
              No credit card required. Keep clicking, keep hosting
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
