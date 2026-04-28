import { describe, expect, it } from 'vitest';
import { TrainingGoal } from '@/types/training';
import { findActiveGoal, getTargetValueForBucket } from './goals.utils';

describe('Goals Utilities', () => {
  const mockGoals: TrainingGoal[] = [
    {
      id: '1',
      userId: 'user-1',
      sportTypeId: 'sport-bike',
      metric: 'distance',
      targetValue: 200,
      period: 'weekly',
      startDate: '2026-04-01',
      endDate: '2026-04-30',
    },
    {
      id: '2',
      userId: 'user-1',
      sportTypeId: 'sport-run',
      metric: 'duration',
      targetValue: 120, // 2 hours
      period: 'weekly',
      startDate: '2026-04-01',
      endDate: '2026-04-30',
    },
  ];

  describe('findActiveGoal', () => {
    it('returns the correct goal for a given date within range', () => {
      const bucketStart = new Date('2026-04-15');
      const bucketEnd = new Date('2026-04-22');
      const goal = findActiveGoal(
        mockGoals,
        'sport-bike',
        'distance',
        bucketStart,
        bucketEnd,
      );
      expect(goal).toBeDefined();
      expect(goal?.id).toBe('1');
    });

    it('returns undefined if no goal matches the date', () => {
      const bucketStart = new Date('2026-05-01');
      const bucketEnd = new Date('2026-05-08');
      const goal = findActiveGoal(
        mockGoals,
        'sport-bike',
        'distance',
        bucketStart,
        bucketEnd,
      );
      expect(goal).toBeUndefined();
    });

    it('returns undefined if sportTypeId does not match', () => {
      const bucketStart = new Date('2026-04-15');
      const bucketEnd = new Date('2026-04-22');
      const goal = findActiveGoal(
        mockGoals,
        'sport-swim',
        'distance',
        bucketStart,
        bucketEnd,
      );
      expect(goal).toBeUndefined();
    });

    it('returns undefined if metric does not match', () => {
      const bucketStart = new Date('2026-04-15');
      const bucketEnd = new Date('2026-04-22');
      const goal = findActiveGoal(
        mockGoals,
        'sport-bike',
        'duration',
        bucketStart,
        bucketEnd,
      );
      expect(goal).toBeUndefined();
    });
  });

  describe('getTargetValueForBucket', () => {
    it('returns null if goal is undefined', () => {
      expect(getTargetValueForBucket(undefined, 'distance')).toBeNull();
    });

    it('returns distance value as is', () => {
      const goal = mockGoals[0];
      expect(getTargetValueForBucket(goal, 'distance')).toBe(200);
    });

    it('converts duration minutes to hours', () => {
      const goal = mockGoals[1];
      expect(getTargetValueForBucket(goal, 'duration')).toBe(2);
    });

    it('handles decimal durations correctly', () => {
      const goal = { ...mockGoals[1], targetValue: 90 }; // 1.5 hours
      expect(getTargetValueForBucket(goal, 'duration')).toBe(1.5);
    });
  });
});
