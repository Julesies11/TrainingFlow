import {
  CreateNoteInput,
  Note,
  NoteRecord,
  UpdateNoteInput,
} from '@/types/training';
import { supabase } from '@/lib/supabase';

function mapDbNote(n: NoteRecord): Note {
  return {
    id: n.id,
    userId: n.user_id,
    date: n.date,
    content: n.content,
    createdAt: n.created_at,
  };
}

export const notesApi = {
  async getAll(
    userId: string,
    fromDate?: string,
    toDate?: string,
  ): Promise<Note[]> {
    let query = supabase.from('tf_notes').select('*').eq('user_id', userId);

    if (fromDate) {
      query = query.gte('date', fromDate);
    }
    if (toDate) {
      query = query.lte('date', toDate);
    }

    const { data, error } = await query.order('date', { ascending: true });

    if (error) throw error;
    return (data || []).map(mapDbNote);
  },

  async create(input: CreateNoteInput, userId: string): Promise<Note> {
    const { data, error } = await supabase
      .from('tf_notes')
      .insert({
        user_id: userId,
        date: input.date,
        content: input.content,
      })
      .select()
      .single();

    if (error) throw error;
    return mapDbNote(data);
  },

  async createBulk(inputs: CreateNoteInput[], userId: string): Promise<void> {
    const { error } = await supabase.from('tf_notes').insert(
      inputs.map((n) => ({
        user_id: userId,
        date: n.date,
        content: n.content,
      })),
    );

    if (error) throw error;
  },

  async update(input: UpdateNoteInput, userId: string): Promise<Note> {
    const { id, ...updates } = input;
    const { data, error } = await supabase
      .from('tf_notes')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return mapDbNote(data);
  },

  async remove(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('tf_notes')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  },
};
