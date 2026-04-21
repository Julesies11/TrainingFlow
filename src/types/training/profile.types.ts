import { IntensitySettings, WorkoutTypeOptions } from './sports.types';

export interface UserProfile {
  id: string;
  updated_at?: string;
  theme: 'light' | 'dark';
  avatar_url?: string;
  workout_type_options: WorkoutTypeOptions;
  effort_settings: IntensitySettings;
}

export interface DailyMetrics {
  date: string;
  duration: number;
  distance: number;
  tss?: number;
  ctl?: number;
  atl?: number;
  tsb?: number;
}
