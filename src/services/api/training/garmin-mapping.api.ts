import { GarminSportMapping } from '@/types/training/sports.types';
import { supabase } from '@/lib/supabase';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbGarminMapping(m: any): GarminSportMapping {
  return {
    id: m.id,
    garminActivityType: m.garmin_activity_type,
    sportTypeId: m.sport_type_id,
    userId: m.user_id || undefined,
    isSystem: m.is_system || false,
  };
}

export const garminMappingApi = {
  async getAll(): Promise<GarminSportMapping[]> {
    const { data, error } = await supabase
      .from('tf_garmin_sport_mapping')
      .select('*')
      .order('garmin_activity_type');

    if (error) throw error;
    return (data || []).map(mapDbGarminMapping);
  },

  async upsert(
    mapping: Partial<GarminSportMapping>,
    userId: string,
  ): Promise<GarminSportMapping> {
    const { data, error } = await supabase
      .from('tf_garmin_sport_mapping')
      .upsert({
        garmin_activity_type: mapping.garminActivityType,
        sport_type_id: mapping.sportTypeId,
        user_id: userId,
        is_system: false, // Users can only create non-system mappings
      })
      .select()
      .single();

    if (error) throw error;
    return mapDbGarminMapping(data);
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase
      .from('tf_garmin_sport_mapping')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
