import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workoutsApi, libraryApi, goalsApi, profileApi } from '@/services/api/training';
import { useSupabaseUserId } from './use-supabase-user';
import { Workout, LibraryWorkout, EventGoal, UserProfile } from '@/types/training';

// ─── Query Keys ──────────────────────────────────────────────
const KEYS = {
  workouts: (uid: string) => ['workouts', uid] as const,
  library: (uid: string) => ['library', uid] as const,
  goals: (uid: string) => ['goals', uid] as const,
  profile: (uid: string) => ['profile', uid] as const,
};

// ─── Profile ─────────────────────────────────────────────────
export function useProfile() {
  const userId = useSupabaseUserId();
  return useQuery({
    queryKey: KEYS.profile(userId ?? ''),
    queryFn: () => profileApi.get(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
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

// ─── Goals ───────────────────────────────────────────────────
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
    mutationFn: (goal: Partial<EventGoal>) => goalsApi.create(goal, userId!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.goals(userId!) });
    },
  });
}

export function useUpdateGoal() {
  const userId = useSupabaseUserId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (goal: EventGoal) => goalsApi.update(goal, userId!),
    onMutate: async (updated) => {
      await qc.cancelQueries({ queryKey: KEYS.goals(userId!) });
      const prev = qc.getQueryData<EventGoal[]>(KEYS.goals(userId!));
      qc.setQueryData<EventGoal[]>(KEYS.goals(userId!), (old) =>
        old?.map((g) => (g.id === updated.id ? updated : g)),
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(KEYS.goals(userId!), ctx.prev);
    },
    onSettled: () => {
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
