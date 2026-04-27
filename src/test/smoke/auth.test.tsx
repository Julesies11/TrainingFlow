import { ResetPasswordPage } from '@/auth/pages/reset-password-page';
import { SignInPage } from '@/auth/pages/signin-page';
import { SignUpPage } from '@/auth/pages/signup-page';
import { describe, expect, it } from 'vitest';
import { act, render, screen } from '../test-utils';

describe('Smoke Test: Auth Pages', () => {
  it('renders SignIn page with text branding', async () => {
    await act(async () => {
      render(<SignInPage />);
    });
    // Check for the heading and the welcome text
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeDefined();
    expect(screen.getByText(/welcome back to trainingflow/i)).toBeDefined();
  });

  it('renders SignUp page with text branding', async () => {
    await act(async () => {
      render(<SignUpPage />);
    });
    expect(screen.getByRole('heading', { name: /sign up/i })).toBeDefined();
    expect(
      screen.getByText(/get started with your trainingflow account/i),
    ).toBeDefined();
  });

  it('renders ResetPassword page with text branding', async () => {
    await act(async () => {
      render(<ResetPasswordPage />);
    });
    expect(
      screen.getByRole('heading', { name: /reset password/i }),
    ).toBeDefined();
    expect(
      screen.getByText(/enter your email to reset your trainingflow password/i),
    ).toBeDefined();
  });
});
