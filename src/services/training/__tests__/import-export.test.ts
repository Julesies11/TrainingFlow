import { describe, expect, it } from 'vitest';
import {
  anchorPlanToDate,
  convertDatesToCoordinates,
} from '../import-export.utils';

describe('Import/Export Coordinate Utilities', () => {
  describe('anchorPlanToDate', () => {
    it('anchors relative week/day to absolute dates starting from Monday of anchor week', () => {
      const workouts = [
        { title: 'Week 1 Mon', weekNumber: 1, dayOfWeek: 1 },
        { title: 'Week 1 Sun', weekNumber: 1, dayOfWeek: 7 },
        { title: 'Week 2 Mon', weekNumber: 2, dayOfWeek: 1 },
      ];
      // Tuesday, May 19, 2026. Monday is May 18.
      const anchorDate = '2026-05-19';

      const anchored = anchorPlanToDate(workouts, anchorDate);

      expect(anchored[0].date).toBe('2026-05-18');
      expect(anchored[1].date).toBe('2026-05-24');
      expect(anchored[2].date).toBe('2026-05-25');
    });

    it('ignores workouts that already have dates', () => {
      const workouts = [
        { title: 'Existing', date: '2020-01-01', weekNumber: 1, dayOfWeek: 1 },
      ];
      const anchored = anchorPlanToDate(workouts, '2026-05-19');
      expect(anchored[0].date).toBe('2020-01-01');
    });
  });

  describe('convertDatesToCoordinates', () => {
    it('converts absolute dates to relative week/day based on earliest date', () => {
      const workouts = [
        { title: 'Workout 1', date: '2026-05-18' }, // Monday
        { title: 'Workout 2', date: '2026-05-24' }, // Sunday
        { title: 'Workout 3', date: '2026-06-01' }, // Mon week 3
      ];

      const converted = convertDatesToCoordinates(workouts);

      expect(converted[0].weekNumber).toBe(1);
      expect(converted[0].dayOfWeek).toBe(1);

      expect(converted[1].weekNumber).toBe(1);
      expect(converted[1].dayOfWeek).toBe(7);

      expect(converted[2].weekNumber).toBe(3);
      expect(converted[2].dayOfWeek).toBe(1);
    });

    it('handles workouts spanning across years correctly', () => {
      const workouts = [
        { title: 'NYE', date: '2025-12-31' }, // Wednesday
        { title: 'NYD', date: '2026-01-01' }, // Thursday
      ];

      const converted = convertDatesToCoordinates(workouts);
      // Dec 31 2025 is Wednesday. Start of week is Monday Dec 29.
      expect(converted[0].weekNumber).toBe(1);
      expect(converted[0].dayOfWeek).toBe(3);

      expect(converted[1].weekNumber).toBe(1);
      expect(converted[1].dayOfWeek).toBe(4);
    });
  });
});
