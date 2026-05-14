import { render, screen, waitFor } from '@/test/test-utils';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as trainingHooks from '@/hooks/use-training-data';
import { CalendarView } from '../calendar-view';

// Mock hooks
vi.mock('@/hooks/use-training-data', () => ({
  useWorkouts: vi.fn(),
  useEvents: vi.fn(),
  useLibrary: vi.fn(),
  useSportTypes: vi.fn(),
  useEventTypes: vi.fn(),
  useEventPriorities: vi.fn(),
  useUserSportSettings: vi.fn(),
  useProfile: vi.fn(),
  useUpdateProfile: vi.fn(),
  useUpdateWorkout: vi.fn(),
  useCreateWorkout: vi.fn(),
  useNotes: vi.fn(),
  useCreateNote: vi.fn(),
  useUpdateNote: vi.fn(),
  useDeleteNote: vi.fn(),
  useDeleteByPlan: vi.fn().mockReturnValue({ mutate: vi.fn() }),
  useCreateWorkoutsBulk: vi
    .fn()
    .mockReturnValue({ mutate: vi.fn(), isPending: false }),
  useCreateNotesBulk: vi
    .fn()
    .mockReturnValue({ mutate: vi.fn(), isPending: false }),
  useDeleteWorkout: vi.fn(),
  useDeleteWorkoutsBulk: vi
    .fn()
    .mockReturnValue({ mutate: vi.fn(), isPending: false }),
  useUpdateEvent: vi.fn(),
  useDeleteEvent: vi.fn(),
  useGoals: vi.fn(),
  useCreateGoal: vi.fn(),
  useUpdateGoal: vi.fn(),
  useDeleteGoal: vi.fn(),
  useCreateLibraryWorkout: vi.fn(),
  useUpdateLibraryWorkout: vi.fn(),
  useDeleteLibraryWorkout: vi.fn(),
  useCreateEvent: vi.fn(),
}));

vi.mock('@/hooks/use-supabase-user', () => ({
  useSupabaseUserId: vi.fn().mockReturnValue('test-user-id'),
}));

vi.mock('@/hooks/use-is-developer', () => ({
  useIsDeveloper: vi.fn().mockReturnValue(true),
}));

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('CalendarView URL Deep Linking', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(trainingHooks.useWorkouts).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown);
    vi.mocked(trainingHooks.useNotes).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown);
    vi.mocked(trainingHooks.useEvents).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown);
    vi.mocked(trainingHooks.useGoals).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown);
    vi.mocked(trainingHooks.useLibrary).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown);
    vi.mocked(trainingHooks.useSportTypes).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown);
    vi.mocked(trainingHooks.useUserSportSettings).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown);
  });

  it('initializes to month/year from URL parameters', async () => {
    // Render with specific URL params using the new render option
    render(
      <Routes>
        <Route path="/calendar/:year/:month" element={<CalendarView />} />
      </Routes>,
      { initialEntries: ['/calendar/2025/12'] },
    );

    await waitFor(() => {
      // Use getByRole or test ID to be specific, or just check the select trigger content
      const triggers = screen.getAllByRole('combobox');
      expect(triggers[0]).toHaveTextContent(/december/i);
      expect(triggers[1]).toHaveTextContent(/2025/i);
    });
  });

  it('redirects to month/year URL when none is provided', async () => {
    const today = new Date();

    render(
      <Routes>
        <Route path="/calendar" element={<CalendarView />} />
        <Route path="/calendar/:year/:month" element={<CalendarView />} />
      </Routes>,
      { initialEntries: ['/calendar'] },
    );

    await waitFor(() => {
      const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' })
        .format(today)
        .toLowerCase();
      const triggers = screen.getAllByRole('combobox');
      expect(triggers[0]).toHaveTextContent(new RegExp(monthName, 'i'));
    });
  });
});
