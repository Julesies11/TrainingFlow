import { TrainingGoal, TrainingGoalRecord } from '@/types/training';
import { supabase } from '@/lib/supabase';

function mapDbGoal(g: TrainingGoalRecord): TrainingGoal {
  return {
    id: g.id,
    userId: g.user_id,
    sportTypeId: g.sport_type_id,
    eventId: g.event_id,
    metric: g.metric,
    targetValue: Number(g.target_value),
    period: g.period,
    startDate: g.start_date,
    endDate: g.end_date,
    createdAt: g.created_at,
  };
}

function toDbPayload(
  g: Partial<TrainingGoal>,
  userId: string,
): Partial<TrainingGoalRecord> {
  return {
    user_id: userId,
    sport_type_id: g.sportTypeId,
    event_id: g.eventId,
    metric: g.metric,
    target_value: g.targetValue,
    period: g.period,
    start_date: g.startDate,
    end_date: g.endDate,
  };
}

export const goalsApi = {
  async getAll(userId: string): Promise<TrainingGoal[]> {
    const { data, error } = await supabase
      .from('tf_training_goals')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: true });

    if (error) throw error;
    return (data || []).map(mapDbGoal);
  },

  async create(
    goal: Partial<TrainingGoal>,
    userId: string,
  ): Promise<TrainingGoal> {
    const { data, error } = await supabase
      .from('tf_training_goals')
      .insert(toDbPayload(goal, userId))
      .select()
      .single();

    if (error) throw error;
    return mapDbGoal(data);
  },

  async update(goal: TrainingGoal, userId: string): Promise<TrainingGoal> {
    const { user_id, ...rest } = toDbPayload(goal, userId);
    void user_id;
    const { data, error } = await supabase
      .from('tf_training_goals')
      .update(rest)
      .eq('id', goal.id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return mapDbGoal(data);
  },

  async remove(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('tf_training_goals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  },
};
