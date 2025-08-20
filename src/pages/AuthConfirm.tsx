import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const AuthConfirm = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');

        if (token_hash && type) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any,
          });

          if (error) {
            setStatus('error');
            setErrorMessage(error.message);
            toast.error('Email confirmation failed');
          } else {
            setStatus('success');
            toast.success('Email confirmed successfully! Welcome to Smart Pantry!');
            // Redirect to home page after successful confirmation
            setTimeout(() => {
              navigate('/', { replace: true });
            }, 2000);
          }
        } else {
          setStatus('error');
          setErrorMessage('Invalid confirmation link');
        }
      } catch (error: any) {
        setStatus('error');
        setErrorMessage(error.message || 'An unexpected error occurred');
        toast.error('Email confirmation failed');
      }
    };

    confirmEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === 'loading' && <Loader2 className="h-6 w-6 animate-spin" />}
            {status === 'success' && <CheckCircle className="h-6 w-6 text-green-500" />}
            {status === 'error' && <XCircle className="h-6 w-6 text-red-500" />}
            
            {status === 'loading' && 'Confirming your email...'}
            {status === 'success' && 'Email Confirmed!'}
            {status === 'error' && 'Confirmation Failed'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === 'loading' && (
            <p className="text-muted-foreground">
              Please wait while we verify your email address.
            </p>
          )}
          
          {status === 'success' && (
            <>
              <p className="text-muted-foreground">
                Your email has been successfully confirmed! You will be redirected to the app shortly.
              </p>
              <Button onClick={() => navigate('/', { replace: true })} className="w-full">
                Continue to Smart Pantry
              </Button>
            </>
          )}
          
          {status === 'error' && (
            <>
              <p className="text-muted-foreground mb-4">
                {errorMessage || 'There was an issue confirming your email address.'}
              </p>
              <div className="space-y-2">
                <Button onClick={() => navigate('/auth', { replace: true })} className="w-full">
                  Back to Sign In
                </Button>
                <p className="text-sm text-muted-foreground">
                  If you continue to have issues, please try signing up again.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthConfirm;