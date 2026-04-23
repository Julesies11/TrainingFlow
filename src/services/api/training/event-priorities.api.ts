import { EventPriorityRecord } from '@/types/training';
import { supabase } from '@/lib/supabase';

export const eventPrioritiesApi = {
  async getAll(): Promise<EventPriorityRecord[]> {
    const { data, error } = await supabase
      .from('pf_event_priorities')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async create(
    eventPriority: Partial<EventPriorityRecord>,
    userId: string,
  ): Promise<EventPriorityRecord> {
    const { data, error } = await supabase
      .from('pf_event_priorities')
      .insert({
        name: eventPriority.name,
        is_system: eventPriority.is_system ?? false,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(
    eventPriority: EventPriorityRecord,
  ): Promise<EventPriorityRecord> {
    const { data, error } = await supabase
      .from('pf_event_priorities')
      .update({
        name: eventPriority.name,
        is_active: eventPriority.is_active,
        is_system: eventPriority.is_system,
      })
      .eq('id', eventPriority.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase
      .from('pf_event_priorities')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  },
};
