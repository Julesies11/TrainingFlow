import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CreateNoteInput,
  Event,
  EventPriorityRecord,
  EventTypeRecord,
  LibraryWorkout,
  Note,
  SportTypeRecord,
  TrainingGoal,
  UpdateNoteInput,
  UserProfile,
  Workout,
} from '@/types/training';
import {
  eventPrioritiesApi,
  eventsApi,
  eventTypesApi,
  generatorApi,
  goalsApi,
  libraryApi,
  notesApi,
  profileApi,
  sportTypesApi,
  userSportSettingsApi,
  workoutsApi,
} from '@/services/api/training';
import { useSupabaseUserId } from './use-supabase-user';

export { useIsDeveloper } from './use-is-developer';

// ─── Query Keys ──────────────────────────────────────────────
const KEYS = {
  workouts: (uid: string, from?: string, to?: string) =>
    ['workouts', uid, from, to].filter(Boolean) as const,
  library: (uid: string) => ['library', uid] as const,
  events: (uid: string, from?: string, to?: string) =>
    ['events', uid, from, to].filter(Boolean) as const,
  goals: (uid: string) => ['goals', uid] as const,
  notes: (uid: string, from?: string, to?: string) =>
    ['notes', uid, from, to].filter(Boolean) as const,
  profile: (uid: string) => ['profile', uid] as const,
  sportTypes: ['sportTypes'] as const,
  userSportSettings: (uid: string) => ['userSportSettings', uid] as const,
  eventTypes: ['eventTypes'] as const,
  eventPriorities: ['eventPriorities'] as const,
  workoutCategories: ['workoutCategories'] as const,
  planTemplates: (sportTypeId?: string) =>
    ['planTemplates', sportTypeId].filter(Boolean) as const,
};

// ─── Profile ─────────────────────────────────────────────────
export function useProfile() {
  const userId = useSupabaseUserId();
  return useQuery({
    queryKey: KEYS.profile(userId ?? ''),
    queryFn: () => profileApi.get(userId!),
    enabled: !!userId,
    staleTime: 0,
    refetchOnMount: true,
  });
}

export function useUpdateProfile() {
  const userId = useSupabaseUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (updates: Partial<UserProfile>) =>
      profileApi.update(userId!, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.profile(userId!) });
    },
  });
}

// ─── Sport Types (read-only system config) ──────────────────
export function useSportTypes() {
  const userId = useSupabaseUserId();
  return useQuery({
    queryKey: KEYS.sportTypes,
    queryFn: () => sportTypesApi.getAll(),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
  });
}

// ─── Event Types (lookup master) ─────────────────────────────
export function useEventTypes() {
  const userId = useSupabaseUserId();
  return useQuery({
    queryKey: KEYS.eventTypes,
    queryFn: () => eventTypesApi.getAll(),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateEventType() {
  const userId = useSupabaseUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (et: Partial<EventTypeRecord>) =>
      eventTypesApi.create(et, userId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.eventTypes });
    },
  });
}

export function useUpdateEventType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (et: EventTypeRecord) => eventTypesApi.update(et),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.eventTypes });
    },
  });
}

export function useDeleteEventType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => eventTypesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.eventTypes });
    },
  });
}

// ─── Event Priorities (lookup master) ────────────────────────
export function useEventPriorities() {
  const userId = useSupabaseUserId();
  return useQuery({
    queryKey: KEYS.eventPriorities,
    queryFn: () => eventPrioritiesApi.getAll(),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateEventPriority() {
  const userId = useSupabaseUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ep: Partial<EventPriorityRecord>) =>
      eventPrioritiesApi.create(ep, userId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.eventPriorities });
    },
  });
}

export function useUpdateEventPriority() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ep: EventPriorityRecord) => eventPrioritiesApi.update(ep),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.eventPriorities });
    },
  });
}

export function useDeleteEventPriority() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => eventPrioritiesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.eventPriorities });
    },
  });
}

// ─── User Sport Settings (color overrides) ──────────────────
export function useUserSportSettings() {
  const userId = useSupabaseUserId();
  return useQuery({
    queryKey: KEYS.userSportSettings(userId ?? ''),
    queryFn: () => userSportSettingsApi.getAll(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpsertUserSportSettings() {
  const userId = useSupabaseUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      sportTypeId: string;
      settings: {
        effort1Hex?: string;
        effort2Hex?: string;
        effort3Hex?: string;
        effort4Hex?: string;
        effort1Label?: string;
        effort2Label?: string;
        effort3Label?: string;
        effort4Label?: string;
      };
    }) => userSportSettingsApi.upsert(userId!, args.sportTypeId, args.settings),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.userSportSettings(userId!) });
    },
  });
}

// ─── Admin Sport Types (system CRUD) ─────────────────────────
export function useCreateSportType() {
  const userId = useSupabaseUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (st: Partial<SportTypeRecord>) =>
      sportTypesApi.create(st, userId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.sportTypes });
    },
  });
}

export function useUpdateSportType() {
  const userId = useSupabaseUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (st: SportTypeRecord) => sportTypesApi.update(st, userId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.sportTypes });
    },
  });
}

export function useDeleteSportType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sportTypesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.sportTypes });
    },
  });
}

// ─── Workouts ────────────────────────────────────────────────
export function useWorkouts(range?: { from?: string; to?: string }) {
  const userId = useSupabaseUserId();
  return useQuery({
    queryKey: KEYS.workouts(userId ?? '', range?.from, range?.to),
    queryFn: () => workoutsApi.getAll(userId!, range?.from, range?.to),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateWorkout() {
  const userId = useSupabaseUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (workout: Partial<Workout>) =>
      workoutsApi.create(workout, userId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.workouts(userId!) });
    },
  });
}

export function useCreateWorkoutsBulk() {
  const userId = useSupabaseUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (workouts: Partial<Workout>[]) =>
      workoutsApi.createBulk(workouts, userId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.workouts(userId!) });
    },
  });
}

export function useUpdateWorkout() {
  const userId = useSupabaseUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (workout: Workout) => workoutsApi.update(workout, userId!),
    onMutate: async (updated) => {
      await qc.cancelQueries({ queryKey: KEYS.workouts(userId!) });
      const prev = qc.getQueryData<Workout[]>(KEYS.workouts(userId!));
      qc.setQueryData<Workout[]>(KEYS.workouts(userId!), (old) =>
        old?.map((w) => (w.id === updated.id ? updated : w)),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(KEYS.workouts(userId!), ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: KEYS.workouts(userId!) });
    },
  });
}

export function useDeleteWorkout() {
  const userId = useSupabaseUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      mode,
      recurrenceId,
      fromDate,
    }: {
      id: string;
      mode: 'single' | 'future';
      recurrenceId?: string;
      fromDate?: string;
    }) => {
      if (mode === 'future' && recurrenceId && fromDate) {
        return workoutsApi.deleteFuture(recurrenceId, fromDate, userId!);
      }
      return workoutsApi.deleteSingle(id, userId!);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.workouts(userId!) });
    },
  });
}

export function useDeleteWorkoutsBulk() {
  const userId = useSupabaseUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (filters: {
      fromDate: string;
      toDate: string;
      sportTypeIds: string[];
      daysOfWeek?: number[];
    }) => workoutsApi.deleteBulk(filters, userId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workouts', userId] });
    },
  });
}

export function useDeleteByPlan() {
  const userId = useSupabaseUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (planId: string) => workoutsApi.deleteByPlan(planId, userId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workouts', userId] });
    },
  });
}

// ─── Library ─────────────────────────────────────────────────
export function useLibrary() {
  const userId = useSupabaseUserId();
  return useQuery({
    queryKey: KEYS.library(userId ?? ''),
    queryFn: () => libraryApi.getAll(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateLibraryWorkout() {
  const userId = useSupabaseUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (workout: Partial<LibraryWorkout>) =>
      libraryApi.create(workout, userId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.library(userId!) });
    },
  });
}

export function useUpdateLibraryWorkout() {
  const userId = useSupabaseUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (workout: LibraryWorkout) =>
      libraryApi.update(workout, userId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.library(userId!) });
    },
  });
}

export function useDeleteLibraryWorkout() {
  const userId = useSupabaseUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => libraryApi.remove(id, userId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.library(userId!) });
    },
  });
}

// ─── Events ──────────────────────────────────────────────────
export function useEvents(range?: { from?: string; to?: string }) {
  const userId = useSupabaseUserId();
  return useQuery({
    queryKey: KEYS.events(userId ?? '', range?.from, range?.to),
    queryFn: () => eventsApi.getAll(userId!, range?.from, range?.to),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateEvent() {
  const userId = useSupabaseUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (event: Partial<Event>) => eventsApi.create(event, userId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.events(userId!) });
    },
  });
}

export function useUpdateEvent() {
  const userId = useSupabaseUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (event: Event) => eventsApi.update(event, userId!),
    onMutate: async (updated) => {
      await qc.cancelQueries({ queryKey: KEYS.events(userId!) });
      const prev = qc.getQueryData<Event[]>(KEYS.events(userId!));
      qc.setQueryData<Event[]>(KEYS.events(userId!), (old) =>
        old?.map((e) => (e.id === updated.id ? updated : e)),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(KEYS.events(userId!), ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: KEYS.events(userId!) });
    },
  });
}

export function useDeleteEvent() {
  const userId = useSupabaseUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => eventsApi.remove(id, userId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.events(userId!) });
    },
  });
}

// ─── Goals ──────────────────────────────────────────────────
export function useGoals() {
  const userId = useSupabaseUserId();
  return useQuery({
    queryKey: KEYS.goals(userId ?? ''),
    queryFn: () => goalsApi.getAll(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateGoal() {
  const userId = useSupabaseUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (goal: Partial<TrainingGoal>) => goalsApi.create(goal, userId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.goals(userId!) });
    },
  });
}

export function useUpdateGoal() {
  const userId = useSupabaseUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (goal: TrainingGoal) => goalsApi.update(goal, userId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.goals(userId!) });
    },
  });
}

export function useDeleteGoal() {
  const userId = useSupabaseUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => goalsApi.remove(id, userId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.goals(userId!) });
    },
  });
}

// ─── Notes ──────────────────────────────────────────────────
export function useNotes(range?: { from?: string; to?: string }) {
  const userId = useSupabaseUserId();
  return useQuery({
    queryKey: KEYS.notes(userId ?? '', range?.from, range?.to),
    queryFn: () => notesApi.getAll(userId!, range?.from, range?.to),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateNote() {
  const userId = useSupabaseUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (note: CreateNoteInput) => notesApi.create(note, userId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.notes(userId!) });
    },
  });
}

export function useCreateNotesBulk() {
  const userId = useSupabaseUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notes: CreateNoteInput[]) =>
      notesApi.createBulk(notes, userId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.notes(userId!) });
    },
  });
}

export function useUpdateNote() {
  const userId = useSupabaseUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (note: UpdateNoteInput) => notesApi.update(note, userId!),
    onMutate: async (updated) => {
      await qc.cancelQueries({ queryKey: KEYS.notes(userId!) });
      const prev = qc.getQueryData<Note[]>(KEYS.notes(userId!));
      qc.setQueryData<Note[]>(KEYS.notes(userId!), (old) =>
        old?.map((n) => (n.id === updated.id ? { ...n, ...updated } : n)),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(KEYS.notes(userId!), ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: KEYS.notes(userId!) });
    },
  });
}

export function useDeleteNote() {
  const userId = useSupabaseUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notesApi.remove(id, userId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.notes(userId!) });
    },
  });
}

// ─── Generator ──────────────────────────────────────────────
export function useWorkoutCategories() {
  const userId = useSupabaseUserId();
  return useQuery({
    queryKey: KEYS.workoutCategories,
    queryFn: () => generatorApi.getCategories(),
    enabled: !!userId,
    staleTime: 60 * 60 * 1000, // Categories are relatively static
  });
}

export function usePlanTemplates() {
  const userId = useSupabaseUserId();
  return useQuery({
    queryKey: KEYS.planTemplates(),
    queryFn: () => generatorApi.getTemplates(),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreatePlanTemplate() {
  const userId = useSupabaseUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (template: Partial<PlanTemplate>) =>
      generatorApi.createTemplate(template, userId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.planTemplates() });
    },
  });
}

export function useUpdatePlanTemplate() {
  const userId = useSupabaseUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (template: PlanTemplate) =>
      generatorApi.updateTemplate(template, userId!),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: KEYS.planTemplates() });
      qc.setQueryData(KEYS.planTemplates(), (old: PlanTemplate[] | undefined) =>
        old?.map((t) => (t.id === data.id ? data : t)),
      );
    },
  });
}

export function useDeletePlanTemplate() {
  const userId = useSupabaseUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => generatorApi.deleteTemplate(id, userId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.planTemplates() });
    },
  });
}
