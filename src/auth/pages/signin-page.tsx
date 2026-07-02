import { useEffect, useState } from 'react';
import { SupabaseAdapter } from '@/auth/adapters/supabase-adapter';
import { useAuth } from '@/auth/context/auth-context';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LoaderCircleIcon, Lock, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/common/icons';
import { getSigninSchema, SigninSchemaType } from '../forms/signin-schema';

export function SignInPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false);

  // Check for success message from password reset or error messages
  useEffect(() => {
    const pwdReset = searchParams.get('pwd_reset');
    const errorParam = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (pwdReset === 'success') {
      setSuccessMessage(
        'Your password has been successfully reset. You can now sign in with your new password.',
      );
    }

    if (errorParam) {
      switch (errorParam) {
        case 'auth_callback_failed':
          setError(
            errorDescription || 'Authentication failed. Please try again.',
          );
          break;
        case 'auth_callback_error':
          setError(
            errorDescription ||
              'An error occurred during authentication. Please try again.',
          );
          break;
        case 'auth_token_error':
          setError(
            errorDescription ||
              'Failed to set authentication session. Please try again.',
          );
          break;
        default:
          setError(
            errorDescription || 'Authentication error. Please try again.',
          );
          break;
      }
    }
  }, [searchParams]);

  const form = useForm<SigninSchemaType>({
    resolver: zodResolver(getSigninSchema()),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  async function onSubmit(values: SigninSchemaType) {
    try {
      setIsProcessing(true);
      setError(null);

      console.log('Attempting to sign in with email:', values.email);

      // Simple validation
      if (!values.email.trim() || !values.password) {
        setError('Email and password are required');
        return;
      }

      // Sign in using the auth context
      await login(values.email, values.password);

      // Get the 'next' parameter from URL if it exists
      const nextPath = searchParams.get('next') || '/';

      // Use navigate for navigation
      navigate(nextPath);
    } catch (err) {
      console.error('Unexpected sign-in error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred. Please try again.',
      );
    } finally {
      setIsProcessing(false);
    }
  }

  // Handle Google Sign In with Supabase OAuth
  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      setError(null);

      // Get the next path if available
      const nextPath = searchParams.get('next');

      // Calculate the redirect URL
      const redirectTo = nextPath
        ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`
        : `${window.location.origin}/auth/callback`;

      console.log('Initiating Google sign-in with redirect:', redirectTo);

      // Use our adapter to initiate the OAuth flow
      await SupabaseAdapter.signInWithOAuth('google', { redirectTo });

      // The browser will be redirected automatically
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to sign in with Google. Please try again.',
      );
      setIsGoogleLoading(false);
    }
  };

  // Handle Microsoft Sign In with Supabase OAuth
  const handleMicrosoftSignIn = async () => {
    try {
      setIsMicrosoftLoading(true);
      setError(null);

      // Get the next path if available
      const nextPath = searchParams.get('next');

      // Calculate the redirect URL
      const redirectTo = nextPath
        ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`
        : `${window.location.origin}/auth/callback`;

      console.log('Initiating Microsoft sign-in with redirect:', redirectTo);

      // Use our adapter to initiate the OAuth flow
      await SupabaseAdapter.signInWithOAuth('azure', { redirectTo });

      // The browser will be redirected automatically
    } catch (err) {
      console.error('Microsoft sign-in error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to sign in with Microsoft. Please try again.',
      );
      setIsMicrosoftLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await form.handleSubmit(onSubmit)(e);
          } catch (err) {
            console.error('Sign In form resolver error:', err);
            setError(
              err instanceof Error
                ? err.message
                : 'An unexpected validation error occurred. Please try again.',
            );
          }
        }}
        className="block w-full space-y-4"
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
          <h1
            className="text-2xl font-black tracking-tight text-black dark:text-white"
            aria-label="sign in"
          >
            Welcome to Training<span className="text-success">Flow</span>
          </h1>
          <p className="sr-only">Welcome back to trainingflow.</p>
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-destructive/10 text-destructive text-sm border border-destructive/20 text-center">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-4 rounded-xl bg-green-500/10 text-green-600 text-sm border border-green-500/20 text-center">
            {successMessage}
          </div>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-2sm font-semibold tracking-wide">
                Email
              </FormLabel>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-muted-foreground pointer-events-none">
                  <Mail className="w-4.5 h-4.5" />
                </span>
                <FormControl>
                  <Input
                    placeholder="your.email@example.com"
                    type="email"
                    autoComplete="username"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    {...field}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <div className="flex justify-between items-center gap-2.5">
                <FormLabel className="text-2sm font-semibold tracking-wide">
                  Password
                </FormLabel>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-muted-foreground pointer-events-none">
                  <Lock className="w-4.5 h-4.5" />
                </span>
                <FormControl>
                  <Input
                    placeholder="••••••••"
                    type={passwordVisible ? 'text' : 'password'}
                    autoComplete="current-password"
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
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rememberMe"
          render={({ field }) => (
            <FormItem className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal cursor-pointer select-none">
                    Remember me
                  </FormLabel>
                </div>
                <Link
                  to="/auth/reset-password"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full py-2.5 mt-2 rounded-xl bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20 hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer animate-fade-in"
          disabled={isProcessing}
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <LoaderCircleIcon className="h-4 w-4 animate-spin" /> Signing
              In...
            </span>
          ) : (
            'Sign In'
          )}
        </Button>

        <div className="relative flex py-2 items-center text-xs uppercase text-muted-foreground">
          <div className="flex-grow border-t border-border/30"></div>
          <span className="flex-shrink mx-3">Or continue with</span>
          <div className="flex-grow border-t border-border/30"></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isMicrosoftLoading}
            className="w-full py-2.5 rounded-xl border border-border bg-input hover:bg-border/20 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 select-none"
          >
            {isGoogleLoading ? (
              <LoaderCircleIcon className="size-4 animate-spin" />
            ) : (
              <>
                <Icons.googleColorful className="size-5!" /> Google
              </>
            )}
          </Button>
          <Button
            variant="outline"
            type="button"
            onClick={handleMicrosoftSignIn}
            disabled={isGoogleLoading || isMicrosoftLoading}
            className="w-full py-2.5 rounded-xl border border-border bg-input hover:bg-border/20 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 select-none"
          >
            {isMicrosoftLoading ? (
              <LoaderCircleIcon className="size-4 animate-spin" />
            ) : (
              <>
                <Icons.microsoft className="size-4.5!" /> Microsoft
              </>
            )}
          </Button>
        </div>

        <div className="text-center text-sm text-muted-foreground pt-2">
          Don't have an account?{' '}
          <Link
            to="/auth/signup"
            className="font-semibold text-primary hover:underline"
          >
            Sign Up
          </Link>
        </div>
      </form>
    </Form>
  );
}
