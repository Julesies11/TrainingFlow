import { PlanTemplate, WorkoutCategory } from '@/types/training';
import { supabase } from '@/lib/supabase';

interface DbPlanTemplate {
  id: string;
  name: string;
  description?: string;
  total_weeks: number;
  is_system: boolean;
  created_by: string;
  updated_at: string;
  workouts?: DbPlanTemplateWorkout[];
  notes?: DbPlanTemplateNote[];
}

interface DbPlanTemplateWorkout {
  id: string;
  template_id: string;
  week_number: number;
  day_of_week: number;
  sport_type_id: string;
  title: string;
  description?: string;
  planned_duration_minutes: number;
  planned_distance_kilometers: string;
  effort_level: number;
  is_key_workout: boolean;
  order: number;
  recurrence_id?: string;
  recurrence_rule?: unknown;
}

interface DbPlanTemplateNote {
  id: string;
  template_id: string;
  week_number: number;
  day_of_week: number;
  content: string;
  order: number;
}

const mapTemplate = (t: DbPlanTemplate): PlanTemplate => ({
  id: t.id,
  name: t.name,
  description: t.description,
  totalWeeks: t.total_weeks,
  is_system: t.is_system,
  created_by: t.created_by,
  updated_at: t.updated_at,
  workouts: (t.workouts || [])
    .map((w) => ({
      id: w.id,
      templateId: w.template_id,
      weekNumber: w.week_number,
      dayOfWeek: w.day_of_week,
      sportTypeId: w.sport_type_id,
      title: w.title,
      description: w.description,
      plannedDurationMinutes: w.planned_duration_minutes,
      plannedDistanceKilometers: parseFloat(w.planned_distance_kilometers),
      effortLevel: w.effort_level,
      isKeyWorkout: w.is_key_workout,
      order: w.order,
      recurrenceId: w.recurrence_id,
      recurrenceRule: w.recurrence_rule,
    }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  notes: (t.notes || [])
    .map((n) => ({
      id: n.id,
      templateId: n.template_id,
      weekNumber: n.week_number,
      dayOfWeek: n.day_of_week,
      content: n.content,
      order: n.order,
    }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
});

export const generatorApi = {
  async getCategories(): Promise<WorkoutCategory[]> {
    const { data, error } = await supabase
      .from('tf_workout_categories')
      .select('*')
      .order('name');
    if (error) throw error;
    return data || [];
  },

  async getTemplates(): Promise<PlanTemplate[]> {
    const { data, error } = await supabase.from('tf_plan_templates').select(`
        *,
        workouts:tf_plan_template_workouts(*),
        notes:tf_plan_template_notes(*)
      `);
    if (error) throw error;

    const dbTemplates = (data || []) as DbPlanTemplate[];
    return dbTemplates.map(mapTemplate);
  },

  async getTemplateById(id: string): Promise<PlanTemplate> {
    const { data, error } = await supabase
      .from('tf_plan_templates')
      .select(
        `
        *,
        workouts:tf_plan_template_workouts(*),
        notes:tf_plan_template_notes(*)
      `,
      )
      .eq('id', id)
      .single();

    if (error) throw error;
    return mapTemplate(data as DbPlanTemplate);
  },

  async createTemplate(
    template: Partial<PlanTemplate>,
    userId: string,
  ): Promise<PlanTemplate> {
    const { data: templateData, error: templateError } = await supabase
      .from('tf_plan_templates')
      .insert({
        name: template.name,
        sport_type_id: template.sportTypeId,
        description: template.description,
        total_weeks: template.totalWeeks,
        is_system: template.is_system || false,
        created_by: userId,
      })
      .select()
      .single();

    if (templateError) throw templateError;

    // Workouts
    if (template.workouts && template.workouts.length > 0) {
      const workoutsToInsert = template.workouts.map((w) => ({
        template_id: templateData.id,
        week_number: w.weekNumber,
        day_of_week: w.dayOfWeek,
        sport_type_id: w.sportTypeId,
        title: w.title,
        description: w.description,
        planned_duration_minutes: w.plannedDurationMinutes,
        planned_distance_kilometers: w.plannedDistanceKilometers,
        effort_level: w.effortLevel,
        is_key_workout: w.isKeyWorkout,
        order: w.order ?? Date.now(),
        recurrence_id: w.recurrenceId,
        recurrence_rule: w.recurrenceRule,
      }));

      const { error: workoutsError } = await supabase
        .from('tf_plan_template_workouts')
        .insert(workoutsToInsert);

      if (workoutsError) throw workoutsError;
    }

    // Notes
    if (template.notes && template.notes.length > 0) {
      const notesToInsert = template.notes.map((n) => ({
        template_id: templateData.id,
        week_number: n.weekNumber,
        day_of_week: n.dayOfWeek,
        content: n.content,
        order: n.order ?? Date.now(),
      }));

      const { error: notesError } = await supabase
        .from('tf_plan_template_notes')
        .insert(notesToInsert);

      if (notesError) throw notesError;
    }

    return this.getTemplateById(templateData.id);
  },

  async updateTemplate(
    template: PlanTemplate,
    userId: string,
  ): Promise<PlanTemplate> {
    // 1. Update root template
    const { error: templateError } = await supabase
      .from('tf_plan_templates')
      .update({
        name: template.name,
        sport_type_id: template.sportTypeId,
        description: template.description,
        total_weeks: template.totalWeeks,
        is_system: template.is_system,
        updated_at: new Date().toISOString(),
      })
      .eq('id', template.id)
      .eq('created_by', userId);

    if (templateError) throw templateError;

    // 2. Handle Workouts (Clear and Insert)
    const { error: deleteWorkoutsError } = await supabase
      .from('tf_plan_template_workouts')
      .delete()
      .eq('template_id', template.id);

    if (deleteWorkoutsError) throw deleteWorkoutsError;

    if (template.workouts && template.workouts.length > 0) {
      const workoutsToInsert = template.workouts.map((w) => ({
        template_id: template.id,
        week_number: w.weekNumber,
        day_of_week: w.dayOfWeek,
        sport_type_id: w.sportTypeId,
        title: w.title,
        description: w.description,
        planned_duration_minutes: w.plannedDurationMinutes,
        planned_distance_kilometers: w.plannedDistanceKilometers,
        effort_level: w.effortLevel,
        is_key_workout: w.isKeyWorkout,
        order: w.order ?? Date.now(),
        recurrence_id: w.recurrenceId,
        recurrence_rule: w.recurrenceRule,
      }));

      const { error: insertWorkoutsError } = await supabase
        .from('tf_plan_template_workouts')
        .insert(workoutsToInsert);

      if (insertWorkoutsError) throw insertWorkoutsError;
    }

    // 3. Handle Notes (Clear and Insert)
    const { error: deleteNotesError } = await supabase
      .from('tf_plan_template_notes')
      .delete()
      .eq('template_id', template.id);

    if (deleteNotesError) throw deleteNotesError;

    if (template.notes && template.notes.length > 0) {
      const notesToInsert = template.notes.map((n) => ({
        template_id: template.id,
        week_number: n.weekNumber,
        day_of_week: n.dayOfWeek,
        content: n.content,
        order: n.order ?? Date.now(),
      }));

      const { error: insertNotesError } = await supabase
        .from('tf_plan_template_notes')
        .insert(notesToInsert);

      if (insertNotesError) throw insertNotesError;
    }

    return this.getTemplateById(template.id);
  },

  async deleteTemplate(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('tf_plan_templates')
      .delete()
      .eq('id', id)
      .eq('created_by', userId);

    if (error) throw error;
  },
};
