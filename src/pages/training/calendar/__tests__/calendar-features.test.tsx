import { render, screen, waitFor } from '@/test/test-utils';
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
  useCreateWorkoutsBulk: vi
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

describe('CalendarView Features', () => {
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(trainingHooks.useWorkouts).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof trainingHooks.useWorkouts>);
    vi.mocked(trainingHooks.useNotes).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof trainingHooks.useNotes>);
    vi.mocked(trainingHooks.useEvents).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof trainingHooks.useEvents>);
    vi.mocked(trainingHooks.useGoals).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof trainingHooks.useGoals>);
    vi.mocked(trainingHooks.useLibrary).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof trainingHooks.useLibrary>);
    vi.mocked(trainingHooks.useSportTypes).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof trainingHooks.useSportTypes>);
    vi.mocked(trainingHooks.useEventTypes).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof trainingHooks.useEventTypes>);
    vi.mocked(trainingHooks.useEventPriorities).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof trainingHooks.useEventPriorities>);
    vi.mocked(trainingHooks.useUserSportSettings).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof trainingHooks.useUserSportSettings>);
    vi.mocked(trainingHooks.useProfile).mockReturnValue({
      data: { theme: 'light', effort_settings: {} },
      isLoading: false,
    } as unknown as ReturnType<typeof trainingHooks.useProfile>);
    vi.mocked(trainingHooks.useUpdateProfile).mockReturnValue({
      mutate: mockMutate,
    } as unknown as ReturnType<typeof trainingHooks.useUpdateProfile>);
  });

  it('renders action buttons with library as primary', async () => {
    render(<CalendarView />);

    await waitFor(() => {
      expect(screen.queryByText(/loading training data/i)).toBeNull();
    });

    // Check if Library button is present (it has text)
    const libraryButton = screen.getByRole('button', { name: /library/i });
    expect(libraryButton).toBeDefined();
  });

  it('preserves user casing in workout titles', async () => {
    const workouts = [
      {
        id: '1',
        title: 'Mixed CASE Title',
        date: new Date().toISOString().split('T')[0],
        sportTypeId: 'run',
        plannedDurationMinutes: 30,
      },
    ];
    vi.mocked(trainingHooks.useWorkouts).mockReturnValue({
      data: workouts,
      isLoading: false,
    } as unknown as ReturnType<typeof trainingHooks.useWorkouts>);

    render(<CalendarView />);

    await waitFor(() => {
      expect(screen.getByText('Mixed CASE Title')).toBeDefined();
    });
  });

  it('renders calendar notes', async () => {
    const notes = [
      {
        id: 'note-1',
        content: 'Test note content',
        date: new Date().toISOString().split('T')[0],
        userId: 'test-user-id',
        createdAt: new Date().toISOString(),
      },
    ];
    vi.mocked(trainingHooks.useNotes).mockReturnValue({
      data: notes,
      isLoading: false,
    } as unknown as ReturnType<typeof trainingHooks.useNotes>);

    render(<CalendarView />);

    await waitFor(() => {
      expect(screen.getByText('Test note content')).toBeDefined();
    });
  });
});
