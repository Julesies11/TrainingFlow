import { render, screen, waitFor } from '@/test/test-utils';
import { format } from 'date-fns';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as trainingHooks from '@/hooks/use-training-data';
import { DashboardPage } from '../dashboard-page';

// Mock hooks
vi.mock('@/hooks/use-training-data', () => ({
  useWorkouts: vi.fn(),
  useEvents: vi.fn(),
  useSportTypes: vi.fn(),
  useUserSportSettings: vi.fn(),
  useUpdateWorkout: vi.fn(),
  useUpdateEvent: vi.fn(),
  useDeleteWorkout: vi.fn(),
  useDeleteEvent: vi.fn(),
}));

describe('DashboardPage Sessions', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(trainingHooks.useEvents).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof trainingHooks.useEvents>);
    vi.mocked(trainingHooks.useSportTypes).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof trainingHooks.useSportTypes>);
    vi.mocked(trainingHooks.useUserSportSettings).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof trainingHooks.useUserSportSettings>);
    vi.mocked(trainingHooks.useUpdateWorkout).mockReturnValue({
      mutate: vi.fn(),
    } as unknown as ReturnType<typeof trainingHooks.useUpdateWorkout>);
    vi.mocked(trainingHooks.useUpdateEvent).mockReturnValue({
      mutate: vi.fn(),
    } as unknown as ReturnType<typeof trainingHooks.useUpdateEvent>);
    vi.mocked(trainingHooks.useDeleteWorkout).mockReturnValue({
      mutate: vi.fn(),
    } as unknown as ReturnType<typeof trainingHooks.useDeleteWorkout>);
    vi.mocked(trainingHooks.useDeleteEvent).mockReturnValue({
      mutate: vi.fn(),
    } as unknown as ReturnType<typeof trainingHooks.useDeleteEvent>);
  });

  it('renders multiple sessions for today and tomorrow', async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = format(today, 'yyyy-MM-dd');

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = format(tomorrow, 'yyyy-MM-dd');

    const workouts = [
      {
        id: '1',
        title: 'Today Run',
        date: todayStr,
        sportTypeId: 'run',
        workout_order: 1,
      },
      {
        id: '2',
        title: 'Today Swim',
        date: todayStr,
        sportTypeId: 'swim',
        workout_order: 2,
      },
      {
        id: '3',
        title: 'Tomorrow Bike',
        date: tomorrowStr,
        sportTypeId: 'bike',
        workout_order: 1,
      },
    ];

    vi.mocked(trainingHooks.useWorkouts).mockReturnValue({
      data: workouts,
      isLoading: false,
    } as unknown as ReturnType<typeof trainingHooks.useWorkouts>);

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.queryByText(/loading dashboard/i)).toBeNull();
    });

    // Check today's sessions
    expect(screen.getByText("today's sessions")).toBeDefined();
    expect(screen.getByText('Today Run')).toBeDefined();
    expect(screen.getByText('Today Swim')).toBeDefined();

    // Check tomorrow's sessions
    expect(screen.getByText("tomorrow's sessions")).toBeDefined();
    expect(screen.getByText('Tomorrow Bike')).toBeDefined();
  });
});
