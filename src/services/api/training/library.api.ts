import { supabase } from '@/lib/supabase';
import { LibraryWorkout } from '@/types/training';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbLibrary(l: any): LibraryWorkout {
  return {
    id: l.id,
    sport: l.sport,
    workoutType: l.workout_type,
    title: l.title,
    description: l.description,
    plannedDurationMinutes: l.planned_duration_minutes || 0,
    plannedDistanceKilometers: l.planned_distance_km || 0,
    effortLevel: l.intensity_level || 1,
    isKeyWorkout: l.is_key_workout || false,
    intervals: l.intervals || [],
  };
}

export const libraryApi = {
  async getAll(userId: string): Promise<LibraryWorkout[]> {
    const { data, error } = await supabase
      .from('library_workouts')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return (data || []).map(mapDbLibrary);
  },

  async create(workout: Partial<LibraryWorkout>, userId: string): Promise<LibraryWorkout> {
    const { data, error } = await supabase
      .from('library_workouts')
      .insert({
        user_id: userId,
        sport: workout.sport,
        workout_type: workout.workoutType,
        title: workout.title,
        description: workout.description,
        planned_duration_minutes: workout.plannedDurationMinutes,
        planned_distance_km: workout.plannedDistanceKilometers,
        intensity_level: workout.effortLevel,
        is_key_workout: workout.isKeyWorkout,
        intervals: workout.intervals,
      })
      .select()
      .single();

    if (error) throw error;
    return mapDbLibrary(data);
  },

  async update(workout: LibraryWorkout, userId: string): Promise<LibraryWorkout> {
    const { data, error } = await supabase
      .from('library_workouts')
      .update({
        sport: workout.sport,
        workout_type: workout.workoutType,
        title: workout.title,
        description: workout.description,
        planned_duration_minutes: workout.plannedDurationMinutes,
        planned_distance_km: workout.plannedDistanceKilometers,
        intensity_level: workout.effortLevel,
        is_key_workout: workout.isKeyWorkout,
        intervals: workout.intervals,
      })
      .eq('id', workout.id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return mapDbLibrary(data);
  },

  async remove(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('library_workouts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  },
};
