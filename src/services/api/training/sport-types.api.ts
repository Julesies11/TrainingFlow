import { supabase } from '@/lib/supabase';
import { SportTypeRecord } from '@/types/training';

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
      .from('sport_types')
      .select('*')
      .order('name');

    if (error) throw error;
    return (data || []).map(mapDbSportType);
  },
};
