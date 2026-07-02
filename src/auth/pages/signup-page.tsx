import { useState } from 'react';
import { SupabaseAdapter } from '@/auth/adapters/supabase-adapter';
import { useAuth } from '@/auth/context/auth-context';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LoaderCircleIcon, Lock, Mail, User } from 'lucide-react';
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
import { getSignupSchema, SignupSchemaType } from '../forms/signup-schema';

export function SignUpPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { register } = useAuth();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false);

  const form = useForm<SignupSchemaType>({
    resolver: zodResolver(getSignupSchema()),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      terms: false,
    },
  });

  async function onSubmit(values: SignupSchemaType) {
    try {
      setIsProcessing(true);
      setError(null);

      // Register the user with Supabase
      await register(
        values.email,
        values.password,
        values.confirmPassword,
        values.firstName,
        values.lastName,
      );

      // Set success message and metadata
      setSuccessMessage(
        'Registration successful! Please check your email to confirm your account.',
      );

      // After successful registration, you might want to update the user profile
      // with additional metadata (firstName, lastName, etc.)

      // Optionally redirect to login page after a delay
      setTimeout(() => {
        navigate('/auth/signin');
      }, 3000);
    } catch (err) {
      console.error('Registration error:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred during registration. Please try again.',
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
            console.error('Sign Up form resolver error:', err);
            setError(
              err instanceof Error
                ? err.message
                : 'An unexpected validation error occurred. Please try again.',
            );
          }
        }}
        className="block w-full space-y-4"
      >
        <div className="text-center space-y-1 pb-1">
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
          <h1 className="sr-only">sign up</h1>
          <p className="sr-only">Get started with your trainingflow account.</p>
          <p className="text-sm text-muted-foreground font-semibold">
            Create your free TrainingFlow account
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

        {/* First Name & Last Name in grid */}
        <div className="grid grid-cols-2 gap-3.5">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-2sm font-semibold tracking-wide">
                  First Name
                </FormLabel>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-muted-foreground pointer-events-none">
                    <User className="w-4.5 h-4.5" />
                  </span>
                  <FormControl>
                    <Input
                      placeholder="Jane"
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
            name="lastName"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-2sm font-semibold tracking-wide">
                  Last Name
                </FormLabel>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-muted-foreground pointer-events-none">
                    <User className="w-4.5 h-4.5" />
                  </span>
                  <FormControl>
                    <Input
                      placeholder="Doe"
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-border bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
                    autoComplete="email"
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
              <FormLabel className="text-2sm font-semibold tracking-wide">
                Password
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
          name="terms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-2 space-y-0 rounded-md py-1">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-xs text-muted-foreground cursor-pointer select-none">
                  I agree to the Terms and{' '}
                  <Link
                    to="#"
                    className="font-semibold text-primary hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </FormLabel>
                <FormMessage />
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
              <LoaderCircleIcon className="h-4 w-4 animate-spin" /> Creating
              Account...
            </span>
          ) : (
            'Create Account'
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
          Already have an account?{' '}
          <Link
            to="/auth/signin"
            className="font-semibold text-primary hover:underline"
          >
            Sign In
          </Link>
        </div>
      </form>
    </Form>
  );
}
