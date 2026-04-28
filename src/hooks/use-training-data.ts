import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Event,
  EventPriorityRecord,
  EventTypeRecord,
  LibraryWorkout,
  SportTypeRecord,
  TrainingGoal,
  UserProfile,
  Workout,
} from '@/types/training';
import {
  eventPrioritiesApi,
  eventsApi,
  eventTypesApi,
  goalsApi,
  libraryApi,
  profileApi,
  sportTypesApi,
  userSportSettingsApi,
  workoutsApi,
} from '@/services/api/training';
import { useSupabaseUserId } from './use-supabase-user';

// ─── Query Keys ──────────────────────────────────────────────
const KEYS = {
  workouts: (uid: string) => ['workouts', uid] as const,
  library: (uid: string) => ['library', uid] as const,
  events: (uid: string) => ['events', uid] as const,
  goals: (uid: string) => ['goals', uid] as const,
  profile: (uid: string) => ['profile', uid] as const,
  sportTypes: ['sportTypes'] as const,
  userSportSettings: (uid: string) => ['userSportSettings', uid] as const,
  eventTypes: ['eventTypes'] as const,
  eventPriorities: ['eventPriorities'] as const,
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
export function useWorkouts() {
  const userId = useSupabaseUserId();
  return useQuery({
    queryKey: KEYS.workouts(userId ?? ''),
    queryFn: () => workoutsApi.getAll(userId!),
    enabled: !!userId,
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

// ─── Library ─────────────────────────────────────────────────
export function useLibrary() {
  const userId = useSupabaseUserId();
  return useQuery({
    queryKey: KEYS.library(userId ?? ''),
    queryFn: () => libraryApi.getAll(userId!),
    enabled: !!userId,
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
export function useEvents() {
  const userId = useSupabaseUserId();
  return useQuery({
    queryKey: KEYS.events(userId ?? ''),
    queryFn: () => eventsApi.getAll(userId!),
    enabled: !!userId,
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
