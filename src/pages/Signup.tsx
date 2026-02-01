import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MousePointer2, ArrowLeft, Check, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const Signup = () => {
  const navigate = useNavigate();
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

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
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
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (formData.subdomain.length < 3) {
      toast.error('Subdomain must be at least 3 characters');
      return;
    }

    if (!subdomainAvailable) {
      toast.error('Subdomain is not available');
      return;
    }

    setIsLoading(true);
    
    const { error } = await signUp(formData.email, formData.password, formData.subdomain);
    
    setIsLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Account created! Please check your email to verify.');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MousePointer2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">HostClick</span>
          </div>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>
            Sign up to save your hosting days and get your subdomain
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subdomain">Your Subdomain</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="subdomain"
                  name="subdomain"
                  type="text"
                  placeholder="yoursite"
                  value={formData.subdomain}
                  onChange={handleInputChange}
                  required
                  className="flex-1"
                />
                <span className="text-muted-foreground whitespace-nowrap">.hostclick.am</span>
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
                  ? 'This subdomain is taken or invalid'
                  : 'Lowercase letters, numbers, and hyphens only'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
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
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </Button>

            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </p>
            
            <Link 
              to="/" 
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Signup;
