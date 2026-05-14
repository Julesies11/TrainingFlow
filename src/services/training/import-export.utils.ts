import {
  addDays,
  differenceInCalendarDays,
  min,
  parseISO,
  startOfWeek,
} from 'date-fns';
import { formatDateToLocalISO } from './calendar.utils';

export interface CoordinateMappingResult {
  date?: string;
  weekNumber?: number;
  dayOfWeek?: number;
}

/**
 * Anchors relative plan coordinates (week/day) to absolute calendar dates.
 */
export function anchorPlanToDate(
  workouts: Record<string, unknown>[],
  anchorDate: string,
): Record<string, unknown>[] {
  const startOfAnchorWeek = startOfWeek(parseISO(anchorDate), {
    weekStartsOn: 1,
  });

  return workouts.map((w) => {
    if (!w.date && w.weekNumber && w.dayOfWeek) {
      const offsetDays =
        (Number(w.weekNumber) - 1) * 7 + (Number(w.dayOfWeek) - 1);
      return {
        ...w,
        date: formatDateToLocalISO(addDays(startOfAnchorWeek, offsetDays)),
      };
    }
    return w;
  });
}

/**
 * Converts absolute calendar dates to relative plan coordinates (week/day).
 * The earliest workout date is used as the anchor for Week 1.
 */
export function convertDatesToCoordinates(
  workouts: Record<string, unknown>[],
): Record<string, unknown>[] {
  const dates = workouts
    .filter((w) => typeof w.date === 'string')
    .map((w) => parseISO(w.date as string));

  if (dates.length === 0) return workouts;

  const earliestDate = min(dates);
  const startOfPlanWeek = startOfWeek(earliestDate, { weekStartsOn: 1 });

  return workouts.map((w) => {
    if (typeof w.date === 'string' && !w.weekNumber) {
      const workoutDate = parseISO(w.date);
      const diffDays = differenceInCalendarDays(workoutDate, startOfPlanWeek);
      return {
        ...w,
        weekNumber: Math.floor(diffDays / 7) + 1,
        dayOfWeek: (diffDays % 7) + 1,
      };
    }
    return w;
  });
}
