export interface WorkoutCategory {
  id: string;
  name: string;
  color?: string;
  is_system: boolean;
  created_by?: string;
}

export interface PlanTemplate {
  id: string;
  name: string;
  description?: string;
  totalWeeks: number;
  is_system: boolean;
  created_by?: string;
  updated_at?: string;
  workouts?: PlanTemplateWorkout[];
  notes?: PlanTemplateNote[];
}

export interface PlanTemplateWorkout {
  id: string;
  templateId: string;
  weekNumber: number;
  dayOfWeek: number;
  sportTypeId: string;
  title: string;
  description?: string;
  plannedDurationMinutes: number;
  plannedDistanceKilometers: number;
  effortLevel: number;
  isKeyWorkout: boolean;
  order?: number;
  recurrenceId?: string;
  recurrenceRule?: unknown;
}

export interface PlanTemplateNote {
  id: string;
  templateId: string;
  weekNumber: number;
  dayOfWeek: number;
  content: string;
  order?: number;
}
