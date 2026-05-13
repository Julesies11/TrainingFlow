import {
  addDays,
  addWeeks,
  format,
  parseISO,
  startOfWeek,
  subWeeks,
} from 'date-fns';
import { CreateNoteInput, PlanTemplate, Workout } from '@/types/training';

export interface GeneratorInput {
  template: PlanTemplate;
  appliedPlanId: string;
  mode: 'forward' | 'backward';
  anchorDate: string; // The specific start date OR the event date
}

export interface GeneratedPlan {
  workouts: Partial<Workout>[];
  notes: CreateNoteInput[];
}

export function generateTrainingPlan({
  template,
  appliedPlanId,
  mode,
  anchorDate,
}: GeneratorInput): GeneratedPlan {
  const workouts: Partial<Workout>[] = [];
  const notes: CreateNoteInput[] = [];

  if (!template || !anchorDate) return { workouts: [], notes: [] };

  const parsedAnchor = parseISO(anchorDate);
  let planStartMonday: Date;

  if (mode === 'backward') {
    // We align the LAST week of the template to the week containing the anchor (event) date.
    const planEndMonday = startOfWeek(parsedAnchor, { weekStartsOn: 1 });
    planStartMonday = subWeeks(planEndMonday, template.totalWeeks - 1);
  } else {
    // We align the FIRST week of the template to the week containing the anchor (start) date.
    planStartMonday = startOfWeek(parsedAnchor, { weekStartsOn: 1 });
  }

  // Workouts
  (template.workouts || []).forEach((tw) => {
    const weekMonday = addWeeks(planStartMonday, tw.weekNumber - 1);
    const daysToAdd = tw.dayOfWeek - 1;
    const workoutDate = addDays(weekMonday, daysToAdd);

    workouts.push({
      title: tw.title,
      description: tw.description,
      sportTypeId: tw.sportTypeId,
      plannedDurationMinutes: tw.plannedDurationMinutes,
      plannedDistanceKilometers: tw.plannedDistanceKilometers,
      effortLevel: tw.effortLevel,
      isKeyWorkout: tw.isKeyWorkout,
      date: format(workoutDate, 'yyyy-MM-dd'),
      appliedPlanId,
      planTemplateId: template.id,
    });
  });

  // Notes
  (template.notes || []).forEach((tn) => {
    const weekMonday = addWeeks(planStartMonday, tn.weekNumber - 1);
    const daysToAdd = tn.dayOfWeek - 1;
    const noteDate = addDays(weekMonday, daysToAdd);

    notes.push({
      content: tn.content,
      date: format(noteDate, 'yyyy-MM-dd'),
    });
  });

  return { workouts, notes };
}
