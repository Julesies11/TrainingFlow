import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/auth/context/auth-context';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

/**
 * Callback page for OAuth authentication redirects.
 * This component handles the authentication flow after a user signs in with a third-party provider.
 */
export function CallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { saveAuth, setUser: setCurrentUser } = useAuth();
  const verificationAttempted = useRef(false);

  useEffect(() => {
    let timerId: NodeJS.Timeout;

    // Get error parameters
    const errorParam = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (errorParam) {
      setError(errorDescription || 'Authentication failed');
      // After a delay, redirect to signin page with error params
      timerId = setTimeout(() => {
        navigate(
          `/auth/signin?error=${errorParam}&error_description=${encodeURIComponent(errorDescription || 'Authentication failed')}`,
        );
      }, 1500);
      return () => {
        if (timerId) clearTimeout(timerId);
      };
    }

    // The supabase client will automatically handle setting up the session
    // We need to get the session and integrate it with our auth context
    const handleCallback = async () => {
      try {
        console.log('Processing OAuth callback');

        const tokenHash = searchParams.get('token_hash');
        const type = searchParams.get('type');

        if (
          tokenHash &&
          type === 'magiclink' &&
          !verificationAttempted.current
        ) {
          verificationAttempted.current = true;
          console.log('[Callback] Verifying magiclink token hash:', tokenHash);
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'magiclink',
          });

          if (verifyError) {
            console.error('[Callback] verifyOtp error:', verifyError);
            throw verifyError;
          }
          console.log('[Callback] verifyOtp success! Session established.');
        }

        // Get the session from Supabase
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
          throw error;
        }

        if (!data.session) {
          console.error('No session found after OAuth callback');
          throw new Error('Authentication session not established');
        }

        console.log('Session obtained successfully from OAuth provider');

        // Create auth model from session data (same structure as used in regular login)
        const authModel = {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        };

        // Save auth data to context and local storage
        saveAuth(authModel);
        console.log('Auth data saved to context');

        // Get the next URL - either from query param or default to dashboard
        const nextPath = searchParams.get('next') || '/dashboard';

        // Navigate to the target page
        console.log('Redirecting to:', nextPath);
        navigate(nextPath);
      } catch (err) {
        console.error('Error processing OAuth callback:', err);
        setError('An unexpected error occurred during authentication');

        // Redirect to login page after showing error
        timerId = setTimeout(() => {
          navigate(
            '/auth/signin?error=auth_callback_error&error_description=Failed to complete authentication',
          );
        }, 1500);
      }
    };

    handleCallback();

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [navigate, searchParams, saveAuth, setCurrentUser]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      {error ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-destructive">
            Authentication Error
          </h2>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm">Redirecting to sign-in page...</p>
        </div>
      ) : null}
    </div>
  );
}
