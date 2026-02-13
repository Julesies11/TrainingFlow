export type SportType = 'Swim' | 'Bike' | 'Run' | 'Strength';

export interface EffortSetting {
  label: string;
  hexColor: string;
}

export type IntensitySettings = Record<SportType, Record<number, EffortSetting>>;

export type WorkoutTypeOptions = Record<SportType, string[]>;
