import { supabase } from '@/lib/supabase';
import { EventGoal } from '@/types/training';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbGoal(g: any): EventGoal {
  return {
    id: g.id,
    date: g.date,
    type: g.type,
    title: g.title,
    priority: g.priority,
    description: g.description,
  };
}

export const goalsApi = {
  async getAll(userId: string): Promise<EventGoal[]> {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (error) throw error;
    return (data || []).map(mapDbGoal);
  },

  async create(goal: Partial<EventGoal>, userId: string): Promise<EventGoal> {
    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: userId,
        date: goal.date,
        type: goal.type,
        title: goal.title,
        priority: goal.priority,
        description: goal.description,
      })
      .select()
      .single();

    if (error) throw error;
    return mapDbGoal(data);
  },

  async update(goal: EventGoal, userId: string): Promise<EventGoal> {
    const { data, error } = await supabase
      .from('goals')
      .update({
        date: goal.date,
        type: goal.type,
        title: goal.title,
        priority: goal.priority,
        description: goal.description,
      })
      .eq('id', goal.id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return mapDbGoal(data);
  },

  async remove(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  },
};
