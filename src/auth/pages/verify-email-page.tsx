import { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  LoaderCircleIcon,
  Mail,
  ShieldAlert,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toAbsoluteUrl } from '@/lib/helpers';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const verificationAttempted = useRef(false);

  useEffect(() => {
    let timerId: NodeJS.Timeout;

    const verifyToken = async () => {
      const tokenHash =
        searchParams.get('token_hash') || searchParams.get('token');

      if (tokenHash && !verificationAttempted.current) {
        verificationAttempted.current = true;
        setIsProcessing(true);
        setError(null);

        try {
          console.log('[VerifyEmail] Verifying email token hash:', tokenHash);
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'signup', // standard type for signup confirmations
          });

          if (verifyError) {
            console.error('[VerifyEmail] verifyOtp error:', verifyError);
            setError(verifyError.message);
          } else {
            console.log('[VerifyEmail] verifyOtp success! Account confirmed.');
            setSuccess(true);

            // Redirect to dashboard after 3 seconds
            timerId = setTimeout(() => {
              navigate('/dashboard');
            }, 3000);
          }
        } catch (err) {
          console.error('[VerifyEmail] verifyOtp unexpected error:', err);
          setError(
            'Failed to verify your email confirmation token. Please request a new verification link.',
          );
        } finally {
          setIsProcessing(false);
        }
      } else if (!tokenHash) {
        setError(
          'Verification token is missing. Please check the link in your confirmation email.',
        );
      }
    };

    verifyToken();

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [searchParams, navigate]);

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center space-y-1 pb-3">
        <img
          src={toAbsoluteUrl('/media/app/default-logo.svg')}
          className="h-[48px] mx-auto mb-4 dark:hidden"
          alt="Logo"
        />
        <img
          src={toAbsoluteUrl('/media/app/default-logo-dark.svg')}
          className="h-[48px] mx-auto mb-4 hidden dark:block"
          alt="Logo"
        />
        <h1 className="text-2xl font-black lowercase tracking-tighter">
          verify email
        </h1>
        <p className="text-sm text-muted-foreground">
          Activating your TrainingFlow account
        </p>
      </div>

      <div className="mt-4 p-6 rounded-2xl bg-card border border-border/40 shadow-xl space-y-6 text-center animate-fade-in">
        {isProcessing && (
          <div className="space-y-4 py-4">
            <LoaderCircleIcon className="h-10 w-10 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground font-semibold">
              Verifying secure activation token...
            </p>
          </div>
        )}

        {success && (
          <div className="space-y-4 py-2">
            <div className="inline-flex w-12 h-12 rounded-xl bg-green-500/10 items-center justify-center text-green-500 shadow-md">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-foreground">
                Email Confirmed!
              </h2>
              <p className="text-sm text-muted-foreground">
                Your account is now active. Logged in successfully. Redirecting
                you to your dashboard...
              </p>
            </div>
            <Button
              onClick={() => navigate('/dashboard')}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20 hover:opacity-90 transition-all cursor-pointer mt-2"
            >
              Go to Dashboard
            </Button>
          </div>
        )}

        {error && (
          <div className="space-y-4 py-2">
            <div className="inline-flex w-12 h-12 rounded-xl bg-destructive/10 items-center justify-center text-destructive shadow-md">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-foreground">
                Verification Failed
              </h2>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <Button
              onClick={() => navigate('/auth/signin')}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20 hover:opacity-90 transition-all cursor-pointer mt-2"
            >
              Back to Sign In
            </Button>
          </div>
        )}

        {!isProcessing && !success && !error && (
          <div className="space-y-4 py-4 text-center">
            <Mail className="h-10 w-10 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">
              Please click the link sent to your email to verify your account.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
