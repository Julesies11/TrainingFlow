import { useMemo } from 'react';
import {
  Event,
  SportTypeRecord,
  UserSportSettings,
  Workout,
} from '@/types/training';

export interface FCEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  extendedProps: {
    type: 'workout' | 'event';
    workout?: Workout;
    event?: Event;
    sportTypeId?: string;
    effortLevel?: number;
    duration?: number;
    distance?: number;
    isCompleted?: boolean;
    isKeyWorkout?: boolean;
  };
}

export function useCalendarDataFC(
  workouts: Workout[] = [],
  events: Event[] = [],
  sportMap: Map<string, SportTypeRecord>,
  userSettingsMap: Map<string, UserSportSettings>,
  getEffortColor: (
    sport: SportTypeRecord | undefined,
    effort: number,
    settings: UserSportSettings | undefined,
  ) => string,
) {
  const calendarEvents = useMemo((): FCEvent[] => {
    const result: FCEvent[] = [];

    // Convert workouts to events
    workouts.forEach((workout) => {
      const sport = sportMap.get(workout.sportTypeId);
      const userSettings = userSettingsMap.get(workout.sportTypeId);
      const backgroundColor = getEffortColor(
        sport,
        workout.effortLevel || 1,
        userSettings,
      );

      result.push({
        id: `workout-${workout.id}`,
        title: workout.title || 'Untitled Workout',
        start: workout.date,
        backgroundColor,
        borderColor: workout.isKeyWorkout ? '#ffffff' : undefined,
        textColor: '#000000',
        extendedProps: {
          type: 'workout',
          workout,
          sportTypeId: workout.sportTypeId,
          effortLevel: workout.effortLevel || 1,
          duration: workout.isCompleted
            ? workout.actualDurationMinutes || 0
            : workout.plannedDurationMinutes || 0,
          distance: workout.isCompleted
            ? workout.actualDistanceKilometers || 0
            : workout.plannedDistanceKilometers || 0,
          isCompleted: workout.isCompleted,
          isKeyWorkout: workout.isKeyWorkout,
        },
      });
    });

    // Convert events to calendar events
    events.forEach((event) => {
      result.push({
        id: `event-${event.id}`,
        title: event.title,
        start: event.date,
        backgroundColor: '#4f46e5',
        borderColor: '#4f46e5',
        textColor: '#ffffff',
        extendedProps: {
          type: 'event',
          event,
        },
      });
    });

    return result;
  }, [workouts, events, sportMap, userSettingsMap, getEffortColor]);

  return calendarEvents;
}
