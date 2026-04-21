import { ProfilePage } from '@/pages/account/profile';
import { DashboardPage } from '@/pages/dashboard';
import { EventsPage } from '@/pages/training/events';
import { LibraryPage } from '@/pages/training/library';
import { describe, expect, it } from 'vitest';
import { render, screen } from '../test-utils';

// Mocking layout components if necessary, but AllTheProviders should handle basic rendering
// Let's test the pages themselves

describe('Smoke Test: Main Pages', () => {
  it('renders Dashboard page without crashing', async () => {
    render(<DashboardPage />);
    // Add a basic check - adjusting based on actual page content
    expect(screen.getByText(/dashboard/i)).toBeDefined();
  });

  it('renders Profile page without crashing', async () => {
    render(<ProfilePage />);
    expect(screen.getByText(/profile/i)).toBeDefined();
  });

  it('renders Events page without crashing', async () => {
    render(<EventsPage />);
    expect(screen.getByText(/events/i)).toBeDefined();
  });

  it('renders Library page without crashing', async () => {
    render(<LibraryPage />);
    expect(screen.getByText(/library/i)).toBeDefined();
  });
});
