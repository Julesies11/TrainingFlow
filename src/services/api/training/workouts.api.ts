import { Workout } from '@/types/training';
import { supabase } from '@/lib/supabase';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbWorkout(w: any): Workout {
  return {
    id: w.id,
    date: w.date,
    sportTypeId: w.sport_type_id,
    sportName: w.tf_sport_types?.name ?? undefined,
    title: w.title,
    description: w.description,
    plannedDurationMinutes: w.planned_duration_minutes || 0,
    plannedDistanceKilometers: w.planned_distance_km || 0,
    effortLevel: w.effort_level || 1,
    isKeyWorkout: w.is_key_workout || false,
    actualDurationMinutes: w.actual_duration_minutes,
    actualDistanceKilometers: w.actual_distance_km,
    actualTSS: w.actual_tss,
    avgHR: w.avg_hr,
    maxHR: w.max_hr,
    avgPower: w.avg_power,
    maxPower: w.max_power,
    normalizedPower: w.normalized_power,
    totalAscent: w.total_ascent,
    totalDescent: w.total_descent,
    avgCadence: w.avg_cadence,
    calories: w.calories,
    trainingEffect: w.training_effect,
    actual_datetime: w.actual_datetime,
    intervals: w.intervals || [],
    order: w.workout_order ? Number(w.workout_order) : 0,
    recurrenceId: w.recurrence_id,
    recurrenceRule: w.recurrence_rule,
    appliedPlanId: w.applied_plan_id,
    planTemplateId: w.plan_template_id,
    categoryId: w.category_id,
  };
}

function toDbPayload(w: Partial<Workout>, userId: string) {
  const round = (val: number | undefined | null) => {
    if (val === undefined || val === null || isNaN(val)) return null;
    return Math.round(val);
  };

  const num = (val: number | undefined | null) => {
    if (val === undefined || val === null || isNaN(val)) return null;
    return val;
  };

  return {
    user_id: userId,
    date: w.date,
    sport_type_id: w.sportTypeId,
    title: w.title || 'Untitled Workout',
    description: w.description || '',
    planned_duration_minutes: round(w.plannedDurationMinutes) || 0,
    planned_distance_km: num(w.plannedDistanceKilometers) || 0,
    effort_level: round(w.effortLevel) || 1,
    is_key_workout: w.isKeyWorkout || false,
    actual_duration_minutes: round(w.actualDurationMinutes),
    actual_distance_km: num(w.actualDistanceKilometers),
    actual_tss: round(w.actualTSS),
    avg_hr: round(w.avgHR),
    max_hr: round(w.maxHR),
    avg_power: round(w.avgPower),
    max_power: round(w.maxPower),
    normalized_power: round(w.normalizedPower),
    total_ascent: num(w.totalAscent),
    total_descent: num(w.totalDescent),
    avg_cadence: round(w.avgCadence),
    calories: round(w.calories),
    training_effect: num(w.trainingEffect),
    actual_datetime: w.actual_datetime ?? null,
    intervals: w.intervals || [],
    workout_order: round(w.order) || Date.now(),
    recurrence_id: w.recurrenceId ?? null,
    recurrence_rule: w.recurrenceRule ?? null,
    applied_plan_id: w.appliedPlanId ?? null,
    plan_template_id: w.planTemplateId ?? null,
    category_id: w.categoryId ?? null,
  };
}

export const workoutsApi = {
  async getAll(
    userId: string,
    fromDate?: string,
    toDate?: string,
  ): Promise<Workout[]> {
    let query = supabase
      .from('tf_workouts')
      .select(
        `
        id, 
        date, 
        sport_type_id, 
        title, 
        description, 
        planned_duration_minutes, 
        planned_distance_km, 
        effort_level, 
        is_key_workout, 
        actual_duration_minutes, 
        actual_distance_km, 
        actual_tss,
        actual_datetime,
        avg_hr, 
        max_hr,
        avg_power,
        max_power,
        normalized_power,
        total_ascent,
        total_descent,
        avg_cadence,
        calories,
        training_effect,
        intervals, 
        workout_order, 
        recurrence_id, 
        recurrence_rule,
        tf_sport_types(name)
      `,
      )
      .eq('user_id', userId);

    if (fromDate) {
      query = query.gte('date', fromDate);
    }
    if (toDate) {
      query = query.lte('date', toDate);
    }

    const { data, error } = await query.order('date', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapDbWorkout);
  },

  async create(workout: Partial<Workout>, userId: string): Promise<Workout> {
    const { data, error } = await supabase
      .from('tf_workouts')
      .insert(toDbPayload(workout, userId))
      .select()
      .single();

    if (error) throw error;
    return mapDbWorkout(data);
  },

  async createBulk(
    workouts: Partial<Workout>[],
    userId: string,
  ): Promise<Workout[]> {
    const baseTime = Date.now();
    const payload = workouts.map((w, idx) => {
      const dbData = toDbPayload(w, userId);
      return {
        ...dbData,
        id: w.id || crypto.randomUUID(),
        // Ensure unique order even in bulk creation
        workout_order: dbData.workout_order || baseTime + idx,
      };
    });

    const { data, error } = await supabase
      .from('tf_workouts')
      .upsert(payload, { onConflict: 'id' })
      .select();

    if (error) throw error;
    return (data || []).map(mapDbWorkout);
  },

  async update(workout: Workout, userId: string): Promise<Workout> {
    const { user_id, ...rest } = toDbPayload(workout, userId);
    void user_id;
    const { data, error } = await supabase
      .from('tf_workouts')
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
      .from('tf_workouts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async deleteFuture(
    recurrenceId: string,
    fromDate: string,
    userId: string,
  ): Promise<void> {
    const { error } = await supabase
      .from('tf_workouts')
      .delete()
      .eq('user_id', userId)
      .eq('recurrence_id', recurrenceId)
      .gte('date', fromDate);

    if (error) throw error;
  },

  async deleteBulk(
    filters: {
      fromDate: string;
      toDate: string;
      sportTypeIds: string[];
      daysOfWeek?: number[];
    },
    userId: string,
  ): Promise<void> {
    // 1. Fetch workouts within the date range and sport types
    const query = supabase
      .from('tf_workouts')
      .select('id, date')
      .eq('user_id', userId)
      .gte('date', filters.fromDate)
      .lte('date', filters.toDate)
      .in('sport_type_id', filters.sportTypeIds);

    const { data: workouts, error: fetchError } = await query;

    if (fetchError) throw fetchError;
    if (!workouts || workouts.length === 0) return;

    // 2. Filter by day of week if provided
    let idsToDelete = workouts.map((w) => w.id);

    if (filters.daysOfWeek && filters.daysOfWeek.length < 7) {
      const selectedDays = new Set(filters.daysOfWeek);
      idsToDelete = workouts
        .filter((w) => {
          // date is YYYY-MM-DD. Get ISO day of week (1=Mon, 7=Sun)
          const date = new Date(w.date);
          // getDay() is 0=Sun, 1=Mon... 6=Sat
          let dow = date.getDay();
          if (dow === 0) dow = 7; // Convert to 1-7 (Mon-Sun)
          return selectedDays.has(dow);
        })
        .map((w) => w.id);
    }

    if (idsToDelete.length === 0) return;

    // 3. Delete matching workouts in chunks to avoid potential limits
    const chunkSize = 200;
    for (let i = 0; i < idsToDelete.length; i += chunkSize) {
      const chunk = idsToDelete.slice(i, i + chunkSize);
      const { error: deleteError } = await supabase
        .from('tf_workouts')
        .delete()
        .in('id', chunk);

      if (deleteError) throw deleteError;
    }
  },

  async deleteByPlan(planId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('tf_workouts')
      .delete()
      .eq('user_id', userId)
      .eq('applied_plan_id', planId);

    if (error) throw error;
  },
};
