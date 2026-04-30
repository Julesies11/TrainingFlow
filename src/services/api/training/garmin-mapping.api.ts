import { GarminSportMapping } from '@/types/training/sports.types';
import { supabase } from '@/lib/supabase';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbGarminMapping(m: any): GarminSportMapping {
  return {
    id: m.id,
    garminActivityType: m.garmin_activity_type,
    sportTypeId: m.sport_type_id || null,
    garminDistanceUnit: (m.garmin_distance_unit as 'km' | 'm') || 'km',
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
    const isSystem = mapping.isSystem || false;
    const { data, error } = await supabase
      .from('tf_garmin_sport_mapping')
      .upsert(
        {
          id: mapping.id, // Include ID for updates
          garmin_activity_type: mapping.garminActivityType,
          sport_type_id: mapping.sportTypeId || null,
          garmin_distance_unit: mapping.garminDistanceUnit || 'km',
          user_id: isSystem ? null : userId,
          is_system: isSystem,
        },
        { onConflict: 'garmin_activity_type,user_id' },
      )
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
