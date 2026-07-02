import { ChangePasswordPage } from '@/auth/pages/change-password-page';
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

  it('renders SignIn page with branded "Welcome to TrainingFlow" heading', async () => {
    await act(async () => {
      render(<SignInPage />);
    });
    expect(screen.getByText(/Welcome to Training/i)).toBeDefined();
    expect(screen.getAllByText(/Flow/i).length).toBeGreaterThanOrEqual(1);
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

  it('renders SignUp page with new subtitle', async () => {
    await act(async () => {
      render(<SignUpPage />);
    });
    expect(
      screen.getByText(/create your free trainingflow account/i),
    ).toBeDefined();
  });

  it('renders SignIn page with Google and Microsoft OAuth buttons', async () => {
    await act(async () => {
      render(<SignInPage />);
    });
    expect(screen.getByText(/Google/i)).toBeDefined();
    expect(screen.getByText(/Microsoft/i)).toBeDefined();
  });

  it('renders SignUp page with Google and Microsoft OAuth buttons', async () => {
    await act(async () => {
      render(<SignUpPage />);
    });
    expect(screen.getByText(/Google/i)).toBeDefined();
    expect(screen.getByText(/Microsoft/i)).toBeDefined();
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

  it('renders ChangePassword page with invalid token state', async () => {
    await act(async () => {
      render(<ChangePasswordPage />);
    });
    // Without a token, the page should show the "invalid token" instructions
    expect(screen.getByText(/Reset Password/i)).toBeDefined();
    expect(
      screen.getByText(/you need a valid reset link/i),
    ).toBeDefined();
  });
});
