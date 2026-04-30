import { useCalendarDataFC } from '@/pages/training/calendar/hooks/use-calendar-data-fc';
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SportTypeRecord, Workout } from '@/types/training';

describe('Planned Logic Refactor', () => {
  const mockWorkouts: Partial<Workout>[] = [
    {
      id: 'w1',
      date: '2026-05-01',
      sportTypeId: 's1',
      title: 'Planned Workout',
      description: '',
      plannedDurationMinutes: 60,
      plannedDistanceKilometers: 10,
      effortLevel: 2,
      isKeyWorkout: false,
      intervals: [],
    },
  ];

  const mockSportMap = new Map<string, Partial<SportTypeRecord>>([
    ['s1', { id: 's1', name: 'Run', distanceUnit: 'km' }],
  ]);

  it('useCalendarDataFC strictly uses planned values', () => {
    const getEffortColor = () => '#ff0000';
    const { result } = renderHook(() =>
      useCalendarDataFC(
        mockWorkouts as Workout[],
        [],
        mockSportMap as Map<string, SportTypeRecord>,
        new Map(),
        getEffortColor,
      ),
    );

    const events = result.current;
    const workoutEvent = events.find((e) => e.id === 'workout-w1');
    expect(workoutEvent).toBeDefined();
    expect(workoutEvent?.extendedProps.duration).toBe(60); // plannedDurationMinutes
    expect(workoutEvent?.extendedProps.distance).toBe(10); // plannedDistanceKilometers
  });
});
