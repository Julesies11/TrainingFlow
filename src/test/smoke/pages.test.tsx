import { ProfilePage } from '@/pages/account/profile';
import { EventPrioritiesAdminPage } from '@/pages/admin/event-priorities';
import { EventTypesAdminPage } from '@/pages/admin/event-types';
import { DashboardPage } from '@/pages/dashboard';
import {
  CalendarView,
  CalendarViewFC,
  CalendarViewKit,
  CalendarViewMonth,
} from '@/pages/training/calendar';
import { EventsPage } from '@/pages/training/events';
import { LibraryPage } from '@/pages/training/library';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '../test-utils';

// Mock all training data hooks to return data immediately
vi.mock('@/hooks/use-supabase-user', () => ({
  useSupabaseUserId: vi.fn().mockReturnValue('test-user-id'),
}));

vi.mock('@/hooks/use-is-developer', () => ({
  useIsDeveloper: vi.fn().mockReturnValue(true),
}));

vi.mock('@/hooks/use-training-data', () => ({
  useWorkouts: vi.fn().mockReturnValue({ data: [], isLoading: false }),
  useEvents: vi.fn().mockReturnValue({ data: [], isLoading: false }),
  useLibrary: vi.fn().mockReturnValue({ data: [], isLoading: false }),
  useSportTypes: vi.fn().mockReturnValue({ data: [], isLoading: false }),
  useEventTypes: vi.fn().mockReturnValue({ data: [], isLoading: false }),
  useEventPriorities: vi.fn().mockReturnValue({ data: [], isLoading: false }),
  useUserSportSettings: vi.fn().mockReturnValue({ data: [], isLoading: false }),
  useProfile: vi.fn().mockReturnValue({
    data: { theme: 'light', effort_settings: {} },
    isLoading: false,
  }),
  useUpdateProfile: vi.fn().mockReturnValue({ mutate: vi.fn() }),
  useUpdateWorkout: vi.fn().mockReturnValue({ mutate: vi.fn() }),
  useCreateWorkout: vi.fn().mockReturnValue({ mutate: vi.fn() }),
  useCreateWorkoutsBulk: vi.fn().mockReturnValue({ mutate: vi.fn() }),
  useDeleteWorkout: vi.fn().mockReturnValue({ mutate: vi.fn() }),
  useUpdateEvent: vi.fn().mockReturnValue({ mutate: vi.fn() }),
  useDeleteEvent: vi.fn().mockReturnValue({ mutate: vi.fn() }),
  useCreateLibraryWorkout: vi.fn().mockReturnValue({ mutate: vi.fn() }),
  useUpdateLibraryWorkout: vi.fn().mockReturnValue({ mutate: vi.fn() }),
  useDeleteLibraryWorkout: vi.fn().mockReturnValue({ mutate: vi.fn() }),
  useCreateEvent: vi.fn().mockReturnValue({ mutate: vi.fn() }),
  useCreateEventType: vi.fn().mockReturnValue({ mutate: vi.fn() }),
  useUpdateEventType: vi.fn().mockReturnValue({ mutate: vi.fn() }),
  useDeleteEventType: vi.fn().mockReturnValue({ mutate: vi.fn() }),
  useCreateEventPriority: vi.fn().mockReturnValue({ mutate: vi.fn() }),
  useUpdateEventPriority: vi.fn().mockReturnValue({ mutate: vi.fn() }),
  useDeleteEventPriority: vi.fn().mockReturnValue({ mutate: vi.fn() }),
  useUpsertUserSportSettings: vi.fn().mockReturnValue({ mutate: vi.fn() }),
}));

describe('Smoke Test: Main Pages', () => {
  it('renders Dashboard page without crashing', async () => {
    render(<DashboardPage />);
    await waitFor(
      () => {
        expect(screen.queryByText(/loading dashboard/i)).toBeNull();
      },
      { timeout: 5000 },
    );
    // Look for the lowercase header text
    expect(screen.getByText(/athlete dashboard/i)).toBeDefined();
  });

  it('renders Profile page without crashing', async () => {
    render(<ProfilePage />);
    await waitFor(() => {
      expect(screen.queryByText(/loading profile/i)).toBeNull();
    });
    expect(screen.getByText(/athlete profile/i)).toBeDefined();
  });

  it('renders Events page without crashing', async () => {
    render(<EventsPage />);
    await waitFor(() => {
      expect(screen.queryByText(/loading events/i)).toBeNull();
    });
    expect(screen.getByText(/events & goals/i)).toBeDefined();
  });

  it('renders Event Types Admin page without crashing', async () => {
    render(<EventTypesAdminPage />);
    expect(screen.getByText(/event types admin/i)).toBeDefined();
  });

  it('renders Event Priorities Admin page without crashing', async () => {
    render(<EventPrioritiesAdminPage />);
    expect(screen.getByText(/event priorities admin/i)).toBeDefined();
  });

  it('renders Library page without crashing', async () => {
    render(<LibraryPage />);
    expect(screen.getByText(/library/i)).toBeDefined();
  });

  it('renders CalendarView page without crashing', async () => {
    render(<CalendarView />);
    await waitFor(
      () => {
        expect(screen.queryByText(/loading training data/i)).toBeNull();
      },
      { timeout: 5000 },
    );
    // Match any instance of 2026
    expect(screen.getAllByText(/2026/)).toBeDefined();
  });

  it('renders CalendarViewFC page without crashing', async () => {
    render(<CalendarViewFC />);
    await waitFor(() => {
      expect(screen.queryByText(/loading training data/i)).toBeNull();
    });
    expect(screen.getByText(/Training Calendar/i)).toBeDefined();
  });

  it('renders CalendarViewKit page without crashing', async () => {
    render(<CalendarViewKit />);
    expect(screen.getAllByText(/2026/)).toBeDefined();
  });

  it('renders CalendarViewMonth page without crashing', async () => {
    render(<CalendarViewMonth />);
    expect(screen.getAllByText(/2026/)).toBeDefined();
  });
});
