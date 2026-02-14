import { supabase } from '@/lib/supabase';
import { Workout } from '@/types/training';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbWorkout(w: any): Workout {
  return {
    id: w.id,
    date: w.date,
    sportTypeId: w.sport_type_id,
    sportName: w.sport_types?.name ?? undefined,
    title: w.title,
    description: w.description,
    plannedDurationMinutes: w.planned_duration_minutes || 0,
    plannedDistanceKilometers: w.planned_distance_km || 0,
    effortLevel: w.effort_level || 1,
    isKeyWorkout: w.is_key_workout || false,
    isCompleted: w.is_completed || false,
    actualDurationMinutes: w.actual_duration_minutes,
    actualDistanceKilometers: w.actual_distance_km,
    avgHR: w.avg_hr,
    avgPower: w.avg_power,
    intervals: w.intervals || [],
    order: w.workout_order ? Number(w.workout_order) : 0,
    recurrenceId: w.recurrence_id,
    recurrenceRule: w.recurrence_rule,
  };
}

function toDbPayload(w: Partial<Workout>, userId: string) {
  return {
    user_id: userId,
    date: w.date,
    sport_type_id: w.sportTypeId,
    title: w.title,
    description: w.description,
    planned_duration_minutes: w.plannedDurationMinutes,
    planned_distance_km: w.plannedDistanceKilometers,
    effort_level: w.effortLevel,
    is_key_workout: w.isKeyWorkout,
    is_completed: w.isCompleted,
    actual_duration_minutes: w.actualDurationMinutes,
    actual_distance_km: w.actualDistanceKilometers,
    avg_hr: w.avgHR,
    avg_power: w.avgPower,
    intervals: w.intervals,
    workout_order: w.order || Date.now(),
    recurrence_id: w.recurrenceId,
    recurrence_rule: w.recurrenceRule,
  };
}

export const workoutsApi = {
  async getAll(userId: string): Promise<Workout[]> {
    const { data, error } = await supabase
      .from('workouts')
      .select('*, sport_types(name)')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapDbWorkout);
  },

  async create(workout: Partial<Workout>, userId: string): Promise<Workout> {
    const { data, error } = await supabase
      .from('workouts')
      .insert(toDbPayload(workout, userId))
      .select()
      .single();

    if (error) throw error;
    return mapDbWorkout(data);
  },

  async createBulk(workouts: Partial<Workout>[], userId: string): Promise<Workout[]> {
    const payload = workouts.map((w) => toDbPayload(w, userId));
    const { data, error } = await supabase
      .from('workouts')
      .insert(payload)
      .select();

    if (error) throw error;
    return (data || []).map(mapDbWorkout);
  },

  async update(workout: Workout, userId: string): Promise<Workout> {
    const { user_id, ...rest } = toDbPayload(workout, userId);
    void user_id;
    const { data, error } = await supabase
      .from('workouts')
      .update(rest)
      .eq('id', workout.id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return mapDbWorkout(data);
  },

  async deleteSingle(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async deleteFuture(recurrenceId: string, fromDate: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('user_id', userId)
      .eq('recurrence_id', recurrenceId)
      .gte('date', fromDate);

    if (error) throw error;
  },
};
