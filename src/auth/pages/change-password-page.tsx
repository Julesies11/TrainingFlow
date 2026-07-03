import { useEffect, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Eye, EyeOff, LoaderCircleIcon, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toAbsoluteUrl } from '@/lib/helpers';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  getNewPasswordSchema,
  NewPasswordSchemaType,
} from '../forms/reset-password-schema';

export function ChangePasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [tokenValid, setTokenValid] = useState(false);
  const verificationAttempted = useRef(false);

  // Check for different possible token parameter names used by Supabase
  // Supabase might use 'token', 'code', 'token_hash' or pass it as a URL hash
  const token =
    searchParams.get('token') ||
    searchParams.get('code') ||
    searchParams.get('token_hash');

  console.log('Reset token from URL:', token);
  console.log(
    'All search parameters:',
    Object.fromEntries(searchParams.entries()),
  );

  // Process Supabase recovery token
  useEffect(() => {
    const verifyRecoveryToken = async () => {
      const tokenHash = searchParams.get('token_hash') || searchParams.get('token');
      const type = searchParams.get('type') || 'recovery';

      if (tokenHash && !verificationAttempted.current) {
        verificationAttempted.current = true;
        setIsProcessing(true);
        setError(null);
        try {
          console.log('Verifying recovery token via verifyOtp:', tokenHash);
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'recovery',
          });

          if (error) {
            console.error('verifyOtp error:', error);
            setError(error.message);
          } else {
            console.log('verifyOtp success! Session established.');
            setTokenValid(true);
            setSuccessMessage('You can now set your new password');
          }
        } catch (err) {
          console.error('verifyOtp unexpected error:', err);
          setError('Failed to verify security token. Please request a new link.');
        } finally {
          setIsProcessing(false);
        }
      }
    };

    verifyRecoveryToken();

    // This automatically processes the token in the URL hash fragment/redirected by Supabase
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Token is valid and has been processed by Supabase
        console.log('Password recovery mode activated');
        setTokenValid(true);
        setSuccessMessage('You can now set your new password');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [searchParams]);

  // Also check for hash fragment which might contain the token
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const hashToken =
      hashParams.get('token') ||
      hashParams.get('code') ||
      hashParams.get('token_hash');

    if (hashToken && !token) {
      console.log('Found token in URL hash fragment:', hashToken);
      // Optionally, you could update the state or reload the page with the token as a query param
    }
  }, [token]);

  const form = useForm<NewPasswordSchemaType>({
    resolver: zodResolver(getNewPasswordSchema()),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: NewPasswordSchemaType) {
    try {
      setIsProcessing(true);
      setError(null);

      // Use Supabase's updateUser method directly
      // The token is already processed by the onAuthStateChange handler
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      // Set success message
      setSuccessMessage('Password changed successfully!');

      // Reset form
      form.reset();

      // Redirect to login page after a successful password reset
      setTimeout(() => {
        navigate('/auth/signin');
      }, 2000);
    } catch (err) {
      console.error('Password reset error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred. Please try again.',
      );
    } finally {
      setIsProcessing(false);
    }
  }

  if (!token && !tokenValid) {
    return (
      <div className="max-w-md mx-auto space-y-4 animate-fade-in">
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
          <h1 className="text-2xl font-bold tracking-tight">Reset Password</h1>
          <p className="text-sm text-muted-foreground">
            You need a valid reset link to change your password
          </p>
        </div>

        <div className="bg-muted/50 p-4 rounded-xl border border-border">
          <h3 className="font-semibold text-2sm mb-2">
            How to reset your password:
          </h3>
          <ol className="list-decimal ms-4 text-xs space-y-1.5 text-muted-foreground">
            <li>Request a password reset link via email</li>
            <li>Check your email inbox and spam folder</li>
            <li>Click the reset link in the email you receive</li>
            <li>Create a new password on the page that opens</li>
          </ol>
        </div>

        <Button
          asChild
          className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20 hover:opacity-90 transition-all cursor-pointer"
        >
          <Link to="/auth/reset-password">Request a Reset Link</Link>
        </Button>

        <div className="text-center pt-2">
          <Link
            to="/auth/signin"
            className="inline-flex items-center gap-1.5 text-2sm font-semibold text-primary hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <Form {...form}>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await form.handleSubmit(onSubmit)(e);
            } catch (err) {
              console.error('Change password form resolver error:', err);
              setError(
                err instanceof Error
                  ? err.message
                  : 'An unexpected validation error occurred. Please try again.',
              );
            }
          }}
          className="space-y-4"
        >
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
            <h1 className="text-2xl font-bold tracking-tight">
              Set New Password
            </h1>
            <p className="text-sm text-muted-foreground">
              Create a strong password for your account
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 rounded-xl bg-destructive/10 text-destructive text-sm border border-destructive/20 text-center animate-fade-in">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-4 rounded-xl bg-green-500/10 text-green-600 text-sm border border-green-500/20 text-center animate-fade-in">
              {successMessage}
            </div>
          )}

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-2sm font-semibold tracking-wide">
                    New Password
                  </FormLabel>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-muted-foreground pointer-events-none">
                      <Lock className="w-4.5 h-4.5" />
                    </span>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        type={passwordVisible ? 'text' : 'password'}
                        autoComplete="new-password"
                        className="w-full pl-11 pr-11 py-2.5 rounded-xl border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      mode="icon"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer"
                    >
                      {passwordVisible ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-2sm font-semibold tracking-wide">
                    Confirm Password
                  </FormLabel>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-muted-foreground pointer-events-none">
                      <Lock className="w-4.5 h-4.5" />
                    </span>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        type={confirmPasswordVisible ? 'text' : 'password'}
                        autoComplete="new-password"
                        className="w-full pl-11 pr-11 py-2.5 rounded-xl border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      mode="icon"
                      onClick={() =>
                        setConfirmPasswordVisible(!confirmPasswordVisible)
                      }
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent cursor-pointer"
                    >
                      {confirmPasswordVisible ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            className="w-full py-2.5 mt-2 rounded-xl bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20 hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer animate-fade-in"
            disabled={isProcessing || !tokenValid}
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <LoaderCircleIcon className="h-4 w-4 animate-spin" />{' '}
                {!tokenValid ? 'Verifying Link...' : 'Updating Password...'}
              </span>
            ) : (
              'Reset Password'
            )}
          </Button>

          <div className="text-center pt-2">
            <Link
              to="/auth/signin"
              className="inline-flex items-center gap-1.5 text-2sm font-semibold text-primary hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
}
