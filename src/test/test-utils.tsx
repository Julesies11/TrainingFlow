import React, { ReactNode } from 'react';
import { AuthProvider } from '@/auth/providers/supabase-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
// Mock Supabase
import { vi } from 'vitest';
import { I18nProvider } from '@/providers/i18n-provider';
import { SettingsProvider } from '@/providers/settings-provider';
import { ThemeProvider } from '@/providers/theme-provider';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi
        .fn()
        .mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi
        .fn()
        .mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

export function AllTheProviders({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <ThemeProvider>
        <I18nProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <BrowserRouter>{children}</BrowserRouter>
            </AuthProvider>
          </QueryClientProvider>
        </I18nProvider>
      </ThemeProvider>
    </SettingsProvider>
  );
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
