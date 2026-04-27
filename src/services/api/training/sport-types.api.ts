import { SportTypeRecord } from '@/types/training';
import { supabase } from '@/lib/supabase';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbSportType(s: any): SportTypeRecord {
  return {
    id: s.id,
    name: s.name,
    description: s.description || '',
    paceRelevant: s.pace_relevant ?? false,
    paceUnit: s.pace_unit || undefined,
    distanceUnit: s.distance_unit || undefined,
    effort1Label: s.effort1_label || undefined,
    effort1Hex: s.effort1_hex || undefined,
    effort2Label: s.effort2_label || undefined,
    effort2Hex: s.effort2_hex || undefined,
    effort3Label: s.effort3_label || undefined,
    effort3Hex: s.effort3_hex || undefined,
    effort4Label: s.effort4_label || undefined,
    effort4Hex: s.effort4_hex || undefined,
  };
}

export const sportTypesApi = {
  async getAll(): Promise<SportTypeRecord[]> {
    const { data, error } = await supabase
      .from('tf_sport_types')
      .select('*')
      .order('name');

    if (error) throw error;
    return (data || []).map(mapDbSportType);
  },

  async create(
    st: Partial<SportTypeRecord>,
    userId: string,
  ): Promise<SportTypeRecord> {
    const { data, error } = await supabase
      .from('tf_sport_types')
      .insert({
        name: st.name,
        description: st.description || null,
        pace_relevant: st.paceRelevant ?? false,
        pace_unit: st.paceUnit || null,
        distance_unit: st.distanceUnit || null,
        effort1_label: st.effort1Label || null,
        effort1_hex: st.effort1Hex || null,
        effort2_label: st.effort2Label || null,
        effort2_hex: st.effort2Hex || null,
        effort3_label: st.effort3Label || null,
        effort3_hex: st.effort3Hex || null,
        effort4_label: st.effort4Label || null,
        effort4_hex: st.effort4Hex || null,
        created_by: userId,
        modified_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return mapDbSportType(data);
  },

  async update(st: SportTypeRecord, userId: string): Promise<SportTypeRecord> {
    const { data, error } = await supabase
      .from('tf_sport_types')
      .update({
        name: st.name,
        description: st.description || null,
        pace_relevant: st.paceRelevant ?? false,
        pace_unit: st.paceUnit || null,
        distance_unit: st.distanceUnit || null,
        effort1_label: st.effort1Label || null,
        effort1_hex: st.effort1Hex || null,
        effort2_label: st.effort2Label || null,
        effort2_hex: st.effort2Hex || null,
        effort3_label: st.effort3Label || null,
        effort3_hex: st.effort3Hex || null,
        effort4_label: st.effort4Label || null,
        effort4_hex: st.effort4Hex || null,
        modified_by: userId,
        modified_at: new Date().toISOString(),
      })
      .eq('id', st.id)
      .select()
      .single();

    if (error) throw error;
    return mapDbSportType(data);
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase
      .from('tf_sport_types')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
