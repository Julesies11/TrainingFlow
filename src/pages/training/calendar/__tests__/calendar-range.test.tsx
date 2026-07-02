/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, waitFor } from '@/test/test-utils';
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

describe('CalendarView Rolling 3-Year Range Cache', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(trainingHooks.useWorkouts).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);
    vi.mocked(trainingHooks.useNotes).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);
    vi.mocked(trainingHooks.useEvents).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);
    vi.mocked(trainingHooks.useGoals).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);
    vi.mocked(trainingHooks.useLibrary).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);
    vi.mocked(trainingHooks.useSportTypes).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);
    vi.mocked(trainingHooks.useUserSportSettings).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);
  });

  it('computes 3-year rolling query dateRange based on displayYear', async () => {
    render(
      <Routes>
        <Route path="/calendar/:year/:month" element={<CalendarView />} />
      </Routes>,
      { initialEntries: ['/calendar/2026/07'] },
    );

    await waitFor(() => {
      // displayYear is 2026
      // dateRange should be: 2025-01-01 to 2027-12-31
      expect(trainingHooks.useWorkouts).toHaveBeenCalledWith({
        from: '2025-01-01',
        to: '2027-12-31',
      });
      expect(trainingHooks.useNotes).toHaveBeenCalledWith({
        from: '2025-01-01',
        to: '2027-12-31',
      });
      expect(trainingHooks.useEvents).toHaveBeenCalledWith({
        from: '2025-01-01',
        to: '2027-12-31',
      });
    });
  });
});
