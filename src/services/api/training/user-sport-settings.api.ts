import { UserSportSettings } from '@/types/training';
import { supabase } from '@/lib/supabase';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbRow(r: any): UserSportSettings {
  return {
    id: r.id,
    sportTypeId: r.sport_type_id,
    effort1Hex: r.effort1_hex || undefined,
    effort2Hex: r.effort2_hex || undefined,
    effort3Hex: r.effort3_hex || undefined,
    effort4Hex: r.effort4_hex || undefined,
    effort1Label: r.effort1_label || undefined,
    effort2Label: r.effort2_label || undefined,
    effort3Label: r.effort3_label || undefined,
    effort4Label: r.effort4_label || undefined,
  };
}

export const userSportSettingsApi = {
  async getAll(userId: string): Promise<UserSportSettings[]> {
    const { data, error } = await supabase
      .from('pf_user_sport_settings')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return (data || []).map(mapDbRow);
  },

  async upsert(
    userId: string,
    sportTypeId: string,
    settings: {
      effort1Hex?: string;
      effort2Hex?: string;
      effort3Hex?: string;
      effort4Hex?: string;
      effort1Label?: string;
      effort2Label?: string;
      effort3Label?: string;
      effort4Label?: string;
    },
  ): Promise<UserSportSettings> {
    const { data, error } = await supabase
      .from('pf_user_sport_settings')
      .upsert(
        {
          user_id: userId,
          sport_type_id: sportTypeId,
          effort1_hex: settings.effort1Hex || null,
          effort2_hex: settings.effort2Hex || null,
          effort3_hex: settings.effort3Hex || null,
          effort4_hex: settings.effort4Hex || null,
          effort1_label: settings.effort1Label || null,
          effort2_label: settings.effort2Label || null,
          effort3_label: settings.effort3Label || null,
          effort4_label: settings.effort4Label || null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,sport_type_id',
          ignoreDuplicates: false,
        },
      )
      .select()
      .single();

    if (error) throw error;
    return mapDbRow(data);
  },
};
