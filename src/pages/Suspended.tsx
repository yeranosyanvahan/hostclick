import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MousePointer2, AlertTriangle, ArrowLeft } from 'lucide-react';

const Suspended = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex items-center justify-center gap-2 mb-4">
            <MousePointer2 className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">HostClick</span>
          </div>
          <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Account Suspended</CardTitle>
          <CardDescription>
            Your hosting account has been temporarily suspended
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-muted-foreground text-sm space-y-2">
            <p>This could be due to:</p>
            <ul className="list-disc list-inside text-left space-y-1">
              <li>Your hosting days have expired</li>
              <li>Violation of terms of service</li>
              <li>Suspicious activity detected</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Link to="/dashboard">
              <Button className="w-full">
                Go to Dashboard
              </Button>
            </Link>
            
            <p className="text-sm text-muted-foreground">
              Click to add more days and reactivate your hosting
            </p>
          </div>
          
          <Link 
            to="/" 
            className="flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default Suspended;
