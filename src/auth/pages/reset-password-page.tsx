import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, LoaderCircleIcon, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toAbsoluteUrl } from '@/lib/helpers';
import { SupabaseAdapter } from '@/auth/adapters/supabase-adapter';
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
  getResetRequestSchema,
  ResetRequestSchemaType,
} from '../forms/reset-password-schema';

export function ResetPasswordPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<ResetRequestSchemaType>({
    resolver: zodResolver(getResetRequestSchema()),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: ResetRequestSchemaType) {
    try {
      setIsProcessing(true);
      setError(null);

      console.log('Submitting password reset for:', values.email);

      // Request password reset via Edge Function (Resend)
      await SupabaseAdapter.requestPasswordReset(values.email);

      // Set success message
      setSuccessMessage(
        `Password reset link sent to ${values.email}! Please check your inbox and spam folder.`,
      );

      // Reset form
      form.reset();
    } catch (err) {
      console.error('Password reset request error:', err);
      setError(
        err instanceof Error
          ? `Error: ${err.message}. Please ensure your email is correct and try again.`
          : 'An unexpected error occurred. Please try again or contact support.',
      );
    } finally {
      setIsProcessing(false);
    }
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
              console.error('Reset password form resolver error:', err);
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
            <h1 className="text-2xl font-black lowercase tracking-tighter">
              reset password
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email to reset your trainingflow password.
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

            <Button
              type="submit"
              className="w-full py-2.5 mt-2 rounded-xl bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20 hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer animate-fade-in"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <LoaderCircleIcon className="h-4 w-4 animate-spin" /> Sending
                  Link...
                </span>
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </div>

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
