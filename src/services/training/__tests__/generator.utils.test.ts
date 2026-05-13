import { describe, expect, it } from 'vitest';
import { PlanTemplate } from '@/types/training';
import { generateTrainingPlan, GeneratorInput } from '../generator.utils';

describe('generateTrainingPlan', () => {
  const mockTemplate: PlanTemplate = {
    id: 't1',
    name: 'Static 2 Week Plan',
    totalWeeks: 2,
    is_system: true,
    workouts: [
      {
        id: 'tw1',
        templateId: 't1',
        weekNumber: 1,
        dayOfWeek: 2, // Tuesday
        sportTypeId: 's1',
        title: 'Template Interval',
        plannedDurationMinutes: 60,
        plannedDistanceKilometers: 10,
        effortLevel: 3,
        isKeyWorkout: true,
      },
    ],
    notes: [
      {
        id: 'tn1',
        templateId: 't1',
        weekNumber: 2,
        dayOfWeek: 5, // Friday
        content: 'Pack your bags',
      },
    ],
  };

  it('should generate a correct static training plan WORKING BACKWARDS from an event date', () => {
    const input: GeneratorInput = {
      template: mockTemplate,
      appliedPlanId: 'p1',
      mode: 'backward',
      anchorDate: '2026-05-31', // A Sunday
    };

    // Event is on 2026-05-31 (Sunday).
    // Week 2 is the week of the event. Monday is 2026-05-25.
    // Week 1 Monday is 2026-05-18.

    const { workouts, notes } = generateTrainingPlan(input);

    expect(workouts).toHaveLength(1);
    expect(workouts[0].date).toBe('2026-05-19'); // Week 1 Tuesday

    expect(notes).toHaveLength(1);
    expect(notes[0].date).toBe('2026-05-29'); // Week 2 Friday
  });

  it('should generate a correct static training plan STARTING FORWARD from a specific date', () => {
    const input: GeneratorInput = {
      template: mockTemplate,
      appliedPlanId: 'p2',
      mode: 'forward',
      anchorDate: '2026-05-18', // A Monday
    };

    // Plan starts on 2026-05-18 (Monday).
    // Week 1 Monday is 2026-05-18.
    // Week 2 Monday is 2026-05-25.

    const { workouts, notes } = generateTrainingPlan(input);

    expect(workouts).toHaveLength(1);
    expect(workouts[0].date).toBe('2026-05-19'); // Week 1 Tuesday

    expect(notes).toHaveLength(1);
    expect(notes[0].date).toBe('2026-05-29'); // Week 2 Friday
  });

  it('should handle start dates that are not Mondays by aligning to the Monday of that week', () => {
    const input: GeneratorInput = {
      template: mockTemplate,
      appliedPlanId: 'p3',
      mode: 'forward',
      anchorDate: '2026-05-20', // A Wednesday
    };

    // Monday of that week is 2026-05-18.
    // So results should be identical to the Monday start test.

    const { workouts, notes } = generateTrainingPlan(input);

    expect(workouts[0].date).toBe('2026-05-19');
    expect(notes[0].date).toBe('2026-05-29');
  });
});
