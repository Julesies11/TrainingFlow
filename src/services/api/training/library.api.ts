import { supabase } from '@/lib/supabase';
import { LibraryWorkout } from '@/types/training';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbLibrary(l: any): LibraryWorkout {
  return {
    id: l.id,
    sportTypeId: l.sport_type_id || '',
    sportName: l.sport_types?.name || '',
    title: l.title,
    description: l.description || '',
    plannedDurationMinutes: l.planned_duration_minutes || 0,
    plannedDistanceKilometers: l.planned_distance_km || 0,
    effortLevel: l.effort_level || 1,
    isKeyWorkout: l.is_key_workout || false,
  };
}

export const libraryApi = {
  async getAll(userId: string): Promise<LibraryWorkout[]> {
    const { data, error } = await supabase
      .from('library_workouts')
      .select('*, sport_types(name)')
      .eq('user_id', userId);

    if (error) throw error;
    return (data || []).map(mapDbLibrary);
  },

  async create(workout: Partial<LibraryWorkout>, userId: string): Promise<LibraryWorkout> {
    const { data, error } = await supabase
      .from('library_workouts')
      .insert({
        user_id: userId,
        sport_type_id: workout.sportTypeId,
        title: workout.title,
        description: workout.description,
        planned_duration_minutes: workout.plannedDurationMinutes,
        planned_distance_km: workout.plannedDistanceKilometers,
        effort_level: workout.effortLevel,
        is_key_workout: workout.isKeyWorkout,
      })
      .select('*, sport_types(name)')
      .single();

    if (error) throw error;
    return mapDbLibrary(data);
  },

  async update(workout: LibraryWorkout, userId: string): Promise<LibraryWorkout> {
    const { data, error } = await supabase
      .from('library_workouts')
      .update({
        sport_type_id: workout.sportTypeId,
        title: workout.title,
        description: workout.description,
        planned_duration_minutes: workout.plannedDurationMinutes,
        planned_distance_km: workout.plannedDistanceKilometers,
        effort_level: workout.effortLevel,
        is_key_workout: workout.isKeyWorkout,
      })
      .eq('id', workout.id)
      .eq('user_id', userId)
      .select('*, sport_types(name)')
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
