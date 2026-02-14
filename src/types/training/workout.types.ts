export interface Interval {
  id: string;
  type: 'Warm-up' | 'Main Set' | 'Cool-down' | 'Recovery';
  durationSeconds?: number;
  distanceMeters?: number;
  targetType: 'Power' | 'Pace' | 'HR' | 'RPE';
  targetValueLow: number;
  targetValueHigh: number;
  reps: number;
}

export interface RecurrenceRule {
  frequency: 'weekly';
  endType: 'count' | 'date';
  endValue: number | string;
}

export interface Workout {
  id: string;
  date: string;
  sportTypeId: string;
  sportName?: string;
  title: string;
  description: string;
  plannedDurationMinutes: number;
  plannedDistanceKilometers: number;
  effortLevel: number;
  isKeyWorkout: boolean;
  intervals: Interval[];
  isCompleted: boolean;
  actualDurationMinutes?: number;
  actualDistanceKilometers?: number;
  avgHR?: number;
  avgPower?: number;
  plannedTSS?: number;
  actualTSS?: number;
  intensityFactor?: number;
  order?: number;
  recurrenceId?: string;
  recurrenceRule?: RecurrenceRule;
}

export interface LibraryWorkout {
  id: string;
  sportTypeId: string;
  sportName?: string;
  title: string;
  description?: string;
  plannedDurationMinutes: number;
  plannedDistanceKilometers: number;
  effortLevel: number;
  isKeyWorkout: boolean;
}
