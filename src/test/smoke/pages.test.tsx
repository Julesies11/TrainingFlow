import { EventPrioritiesPage } from '@/pages/account/event-priorities';
import { EventTypesPage } from '@/pages/account/event-types';
import { ProfilePage } from '@/pages/account/profile';
import { SportTypesPage } from '@/pages/account/sport-types';
import { EventPrioritiesAdminPage } from '@/pages/admin/event-priorities';
import { EventTypesAdminPage } from '@/pages/admin/event-types';
import { SportTypesAdminPage } from '@/pages/admin/sport-types';
import { DashboardPage } from '@/pages/dashboard';
import { CalendarView } from '@/pages/training/calendar';
import { EventsPage } from '@/pages/training/events';
import { GoalsPage } from '@/pages/training/goals';
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
  useNotes: vi.fn().mockReturnValue({ data: [], isLoading: false }),
  useLibrary: vi.fn().mockReturnValue({ data: [], isLoading: false }),
  useSportTypes: vi.fn().mockReturnValue({ data: [], isLoading: false }),
  useEventTypes: vi.fn().mockReturnValue({ data: [], isLoading: false }),
  useEventPriorities: vi.fn().mockReturnValue({ data: [], isLoading: false }),
  useUserSportSettings: vi.fn().mockReturnValue({ data: [], isLoading: false }),
  useProfile: vi.fn().mockReturnValue({
    data: { theme: 'light', effort_settings: {}, calendar_stats_mode: true },
    isLoading: false,
  }),
  useUpdateProfile: vi.fn().mockReturnValue({ mutate: vi.fn() }),
  useUpdateWorkout: vi.fn().mockReturnValue({ mutate: vi.fn() }),
  useCreateWorkout: vi.fn().mockReturnValue({ mutate: vi.fn() }),
  useCreateWorkoutsBulk: vi
    .fn()
    .mockReturnValue({ mutate: vi.fn(), isPending: false }),
  useDeleteWorkout: vi.fn().mockReturnValue({ mutate: vi.fn() }),
  useDeleteWorkoutsBulk: vi
    .fn()
    .mockReturnValue({ mutate: vi.fn(), isPending: false }),
  useUpdateEvent: vi.fn().mockReturnValue({ mutate: vi.fn() }),
  useDeleteEvent: vi.fn().mockReturnValue({ mutate: vi.fn() }),
  useGoals: vi.fn().mockReturnValue({ data: [], isLoading: false }),
  useCreateGoal: vi.fn().mockReturnValue({ mutate: vi.fn() }),
  useUpdateGoal: vi.fn().mockReturnValue({ mutate: vi.fn() }),
  useDeleteGoal: vi.fn().mockReturnValue({ mutate: vi.fn() }),
  useCreateNote: vi.fn().mockReturnValue({ mutate: vi.fn() }),
  useUpdateNote: vi.fn().mockReturnValue({ mutate: vi.fn() }),
  useDeleteNote: vi.fn().mockReturnValue({ mutate: vi.fn() }),
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
  useCreateSportType: vi.fn().mockReturnValue({ mutate: vi.fn() }),
  useUpdateSportType: vi.fn().mockReturnValue({ mutate: vi.fn() }),
  useDeleteSportType: vi.fn().mockReturnValue({ mutate: vi.fn() }),
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

  it('renders Sport Types Admin page without crashing', async () => {
    render(<SportTypesAdminPage />);
    expect(screen.getByText(/sport types admin/i)).toBeDefined();
  });

  it('renders Event Priorities Settings page without crashing', async () => {
    render(<EventPrioritiesPage />);
    await waitFor(() => {
      expect(screen.queryByText(/loading event priorities/i)).toBeNull();
    });
    expect(
      screen.getByText(
        /manage global system and your custom event priorities/i,
      ),
    ).toBeDefined();
  });

  it('renders Event Types Settings page without crashing', async () => {
    render(<EventTypesPage />);
    await waitFor(() => {
      expect(screen.queryByText(/loading event types/i)).toBeNull();
    });
    expect(
      screen.getByText(/manage global system and your custom event types/i),
    ).toBeDefined();
  });

  it('renders Sport Types Settings page without crashing', async () => {
    render(<SportTypesPage />);
    await waitFor(() => {
      expect(screen.queryByText(/loading sport types/i)).toBeNull();
    });
    expect(screen.getByText(/customize effort level colors/i)).toBeDefined();
  });

  it('renders Library page without crashing', async () => {
    render(<LibraryPage />);
    expect(screen.getByText(/library/i)).toBeDefined();
  });

  it('renders Training Goals page without crashing', async () => {
    render(<GoalsPage />);
    await waitFor(() => {
      expect(screen.queryByText(/loading goals/i)).toBeNull();
    });
    expect(screen.getByText(/training goals/i)).toBeDefined();
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
});
