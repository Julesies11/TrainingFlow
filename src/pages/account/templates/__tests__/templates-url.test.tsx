import { render, screen, waitFor } from '@/test/test-utils';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as trainingHooks from '@/hooks/use-training-data';
import { TemplatesPage } from '../templates-page';

// Mock hooks
vi.mock('@/hooks/use-training-data', () => ({
  usePlanTemplates: vi.fn(),
  useSportTypes: vi.fn(),
  useDeletePlanTemplate: vi.fn().mockReturnValue({ mutate: vi.fn() }),
  useLibrary: vi.fn(),
  useUserSportSettings: vi.fn(),
  useCreateLibraryWorkout: vi.fn(),
  useUpdateLibraryWorkout: vi.fn(),
  useDeleteLibraryWorkout: vi.fn(),
  useWorkouts: vi.fn(),
  useNotes: vi.fn(),
  useCreateWorkout: vi.fn(),
  useCreateWorkoutsBulk: vi.fn(),
  useDeleteWorkout: vi.fn(),
  useDeleteByPlan: vi.fn(),
  useIsDeveloper: vi.fn(),
  useCreatePlanTemplate: vi.fn(),
  useUpdatePlanTemplate: vi.fn(),
  useEvents: vi.fn(),
  useGoals: vi.fn(),
  useUpdateWorkout: vi.fn(),
  useUpdateNote: vi.fn(),
  useCreateNote: vi.fn(),
  useDeleteNote: vi.fn(),
  useUpdateEvent: vi.fn(),
  useDeleteEvent: vi.fn(),
  useCreateEvent: vi.fn(),
  useDeleteWorkoutsBulk: vi.fn(),
  usePlanTemplatesAdmin: vi.fn(),
  usePlanTemplatesSystem: vi.fn(),
  useDeleteWorkoutsBulkFromTemplate: vi.fn(),
}));

vi.mock('@/hooks/use-supabase-user', () => ({
  useSupabaseUserId: vi.fn().mockReturnValue('test-user-id'),
}));

describe('TemplatesPage URL Deep Linking', () => {
  const mockTemplates = [
    {
      id: 'template-1',
      name: 'Marathon Base',
      totalWeeks: 12,
      workouts: [],
      notes: [],
    },
    {
      id: 'template-2',
      name: '5K Speed',
      totalWeeks: 4,
      workouts: [],
      notes: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(trainingHooks.usePlanTemplates).mockReturnValue({
      data: mockTemplates,
      isLoading: false,
    } as unknown);
    vi.mocked(trainingHooks.useSportTypes).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown);
    vi.mocked(trainingHooks.useLibrary).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown);
    vi.mocked(trainingHooks.useUserSportSettings).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown);
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

    vi.mocked(trainingHooks.useIsDeveloper).mockReturnValue(true);
    vi.mocked(trainingHooks.useCreatePlanTemplate).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown);
    vi.mocked(trainingHooks.useUpdatePlanTemplate).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown);
    vi.mocked(trainingHooks.useCreateLibraryWorkout).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown);
    vi.mocked(trainingHooks.useUpdateLibraryWorkout).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown);
    vi.mocked(trainingHooks.useDeleteLibraryWorkout).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown);
    vi.mocked(trainingHooks.useCreateWorkoutsBulk).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown);
    vi.mocked(trainingHooks.useUpdateWorkout).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown);
    vi.mocked(trainingHooks.useCreateWorkout).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown);
    vi.mocked(trainingHooks.useDeleteWorkout).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown);
    vi.mocked(trainingHooks.useDeleteWorkoutsBulk).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown);
  });

  it('renders template list when no ID is provided', async () => {
    render(
      <Routes>
        <Route path="/training-plans" element={<TemplatesPage />} />
      </Routes>,
      { initialEntries: ['/training-plans'] },
    );

    await waitFor(() => {
      expect(screen.getByText(/marathon base/i)).toBeInTheDocument();
      expect(screen.getByText(/5k speed/i)).toBeInTheDocument();
    });
  });

  it('opens template builder when ID is provided in URL', async () => {
    render(
      <Routes>
        <Route path="/training-plans" element={<TemplatesPage />} />
        <Route path="/training-plans/:id" element={<TemplatesPage />} />
      </Routes>,
      { initialEntries: ['/training-plans/template-1'] },
    );

    await waitFor(() => {
      // Check for the template name in the input field
      expect(screen.getByDisplayValue(/marathon base/i)).toBeInTheDocument();
      // Check for the "weeks" label which is part of the builder header
      expect(screen.getByText(/weeks/i)).toBeInTheDocument();
    });
  });

  it('opens new plan builder when ID is "new"', async () => {
    render(
      <Routes>
        <Route path="/training-plans" element={<TemplatesPage />} />
        <Route path="/training-plans/:id" element={<TemplatesPage />} />
      </Routes>,
      { initialEntries: ['/training-plans/new'] },
    );

    await waitFor(() => {
      // Check for empty name input
      expect(
        screen.getByPlaceholderText(/plan name\.\.\./i),
      ).toBeInTheDocument();
      // Check for the "weeks" label
      expect(screen.getByText(/weeks/i)).toBeInTheDocument();
    });
  });
});
