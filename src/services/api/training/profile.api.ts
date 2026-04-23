import {
  IntensitySettings,
  UserProfile,
  WorkoutTypeOptions,
} from '@/types/training';
import { supabase } from '@/lib/supabase';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbProfile(p: any): UserProfile {
  let workoutTypeOptions: WorkoutTypeOptions;
  if (typeof p.workout_type_options === 'string') {
    workoutTypeOptions = JSON.parse(p.workout_type_options);
  } else {
    workoutTypeOptions = p.workout_type_options;
  }

  let effortSettings: IntensitySettings;
  if (typeof p.effort_settings === 'string') {
    effortSettings = JSON.parse(p.effort_settings);
  } else {
    effortSettings = p.effort_settings;
  }

  return {
    id: p.id,
    updated_at: p.updated_at,
    theme: p.theme || 'light',
    role: p.role || 'user',
    avatar_url: p.avatar_url,
    workout_type_options: workoutTypeOptions || {
      Swim: ['Easy', 'Hard'],
      Bike: ['Easy', 'Hard'],
      Run: ['Easy', 'Tempo', 'Interval'],
      Strength: ['Full Body', 'Upper', 'Lower'],
    },
    effort_settings: effortSettings || defaultIntensitySettings(),
  };
}

function defaultIntensitySettings(): IntensitySettings {
  return {
    Run: {
      1: { label: 'Pastel Red', hexColor: '#FEE2E2' },
      2: { label: 'Light Red', hexColor: '#FCA5A5' },
      3: { label: 'Standard Red', hexColor: '#EF4444' },
      4: { label: 'Dark Red', hexColor: '#991B1B' },
    },
    Bike: {
      1: { label: 'Pastel Yellow', hexColor: '#FEF9C3' },
      2: { label: 'Light Yellow', hexColor: '#FDE047' },
      3: { label: 'Standard Yellow', hexColor: '#FACC15' },
      4: { label: 'Dark Yellow', hexColor: '#ff961f' },
    },
    Swim: {
      1: { label: 'Pastel Blue', hexColor: '#DBEAFE' },
      2: { label: 'Light Blue', hexColor: '#93C5FD' },
      3: { label: 'Standard Blue', hexColor: '#3B82F6' },
      4: { label: 'Dark Blue', hexColor: '#1E40AF' },
    },
    Strength: {
      1: { label: 'Pastel Green', hexColor: '#DCFCE7' },
      2: { label: 'Light Green', hexColor: '#86EFAC' },
      3: { label: 'Standard Green', hexColor: '#22C55E' },
      4: { label: 'Dark Green', hexColor: '#166534' },
    },
  };
}

export const profileApi = {
  async get(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('pf_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data ? mapDbProfile(data) : null;
  },

  async update(
    userId: string,
    updates: Partial<UserProfile>,
  ): Promise<UserProfile> {
    const dbPayload: Record<string, unknown> = {};
    if (updates.theme !== undefined) dbPayload.theme = updates.theme;
    if (updates.avatar_url !== undefined)
      dbPayload.avatar_url = updates.avatar_url;
    if (updates.workout_type_options !== undefined)
      dbPayload.workout_type_options = updates.workout_type_options;
    if (updates.effort_settings !== undefined)
      dbPayload.effort_settings = updates.effort_settings;

    const { data, error } = await supabase
      .from('pf_profiles')
      .update(dbPayload)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return mapDbProfile(data);
  },
};
