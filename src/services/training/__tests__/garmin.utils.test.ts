import { describe, expect, it } from 'vitest';
import {
  GarminSportMapping,
  SportTypeRecord,
} from '@/types/training/sports.types';
import {
  parseGarminCSV,
  parseGarminTimeToMinutes,
  resolveGarminSportType,
} from '../garmin.utils';

describe('garmin.utils', () => {
  describe('parseGarminTimeToMinutes', () => {
    it('should parse HH:MM:SS format', () => {
      expect(parseGarminTimeToMinutes('01:05:01')).toBe(65);
      expect(parseGarminTimeToMinutes('00:37:05')).toBe(37);
    });

    it('should handle seconds rounding', () => {
      expect(parseGarminTimeToMinutes('00:02:18.7')).toBe(2);
      expect(parseGarminTimeToMinutes('00:02:49.3')).toBe(3);
    });

    it('should handle MM:SS format', () => {
      expect(parseGarminTimeToMinutes('45:03')).toBe(45);
    });

    it('should handle empty or invalid strings', () => {
      expect(parseGarminTimeToMinutes('--')).toBe(0);
      expect(parseGarminTimeToMinutes('')).toBe(0);
    });
  });

  describe('resolveGarminSportType', () => {
    const mockMappings: GarminSportMapping[] = [
      {
        id: '1',
        garminActivityType: 'Running',
        sportTypeId: 'run-id',
        isSystem: true,
      },
      {
        id: '2',
        garminActivityType: 'Running',
        sportTypeId: 'custom-run-id',
        userId: 'user-123',
        isSystem: false,
      },
      {
        id: '3',
        garminActivityType: 'Cycling',
        sportTypeId: 'bike-id',
        isSystem: true,
      },
    ];

    it('should prioritize user mappings', () => {
      expect(resolveGarminSportType('Running', mockMappings, 'user-123')).toBe(
        'custom-run-id',
      );
    });

    it('should fall back to system mappings', () => {
      expect(resolveGarminSportType('Cycling', mockMappings, 'user-123')).toBe(
        'bike-id',
      );
      expect(
        resolveGarminSportType('Running', mockMappings, 'other-user'),
      ).toBe('run-id');
    });

    it('should handle case insensitivity', () => {
      expect(resolveGarminSportType('running', mockMappings, undefined)).toBe(
        'run-id',
      );
    });

    it('should return undefined if no mapping found', () => {
      expect(
        resolveGarminSportType('Swimming', mockMappings, undefined),
      ).toBeUndefined();
    });
  });

  describe('parseGarminCSV', () => {
    const mockMappings: GarminSportMapping[] = [
      {
        id: '1',
        garminActivityType: 'Running',
        sportTypeId: 'run-id',
        isSystem: true,
      },
      {
        id: '2',
        garminActivityType: 'Cycling',
        sportTypeId: 'bike-id',
        isSystem: true,
      },
    ];
    const mockSportTypes: SportTypeRecord[] = [
      { id: 'run-id', name: 'Run', paceRelevant: true },
      { id: 'bike-id', name: 'Bike', paceRelevant: true },
    ];

    it('should correctly parse sample data', async () => {
      const csv = `Activity Type,Date,Title,Distance,Time\nRunning,2026-04-28 16:27:15,Perth Running,11.92,01:05:01`;
      const results = await parseGarminCSV(
        csv,
        mockMappings,
        mockSportTypes,
        'user-1',
      );

      expect(results).toHaveLength(1);
      const first = results[0];
      expect(first.isValid).toBe(true);
      expect(first.workout?.date).toBe('2026-04-28');
      expect(first.workout?.sportTypeId).toBe('run-id');
      expect(first.workout?.plannedDurationMinutes).toBe(65);
      expect(first.workout?.plannedDistanceKilometers).toBe(11.92);
      expect(first.workout?.isCompleted).toBe(true);
    });

    it('should flag unmapped activities as invalid', async () => {
      const csv = `Activity Type,Date,Title,Distance,Time\nSwimming,2026-04-28 16:27:15,Swim,1.5,00:30:00`;
      const results = await parseGarminCSV(
        csv,
        mockMappings,
        mockSportTypes,
        'user-1',
      );

      expect(results[0].isValid).toBe(false);
      expect(results[0].errors).toContain('Unmapped activity type: Swimming');
    });
  });
});
