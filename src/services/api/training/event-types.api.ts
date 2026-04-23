import { EventTypeRecord } from '@/types/training';
import { supabase } from '@/lib/supabase';

export const eventTypesApi = {
  async getAll(): Promise<EventTypeRecord[]> {
    const { data, error } = await supabase
      .from('pf_event_types')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  async create(
    eventType: Partial<EventTypeRecord>,
    userId: string,
  ): Promise<EventTypeRecord> {
    const { data, error } = await supabase
      .from('pf_event_types')
      .insert({
        name: eventType.name,
        is_system: eventType.is_system ?? false,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(eventType: EventTypeRecord): Promise<EventTypeRecord> {
    const { data, error } = await supabase
      .from('pf_event_types')
      .update({
        name: eventType.name,
        is_active: eventType.is_active,
        is_system: eventType.is_system,
      })
      .eq('id', eventType.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase
      .from('pf_event_types')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  },
};
