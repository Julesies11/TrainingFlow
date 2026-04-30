import { describe, expect, it } from 'vitest';
import { SportTypeRecord } from '@/types/training';
import { mapSportNameToId, parseImportData } from '../import.utils';

describe('Import Utilities', () => {
  const mockSports: SportTypeRecord[] = [
    {
      id: 's1',
      name: 'Swim',
      paceRelevant: true,
      paceUnit: 'min/100m',
      distanceUnit: 'm',
    },
    {
      id: 's2',
      name: 'Bike',
      paceRelevant: false,
      paceUnit: 'km/h',
      distanceUnit: 'km',
    },
    {
      id: 's3',
      name: 'Run',
      paceRelevant: true,
      paceUnit: 'min/km',
      distanceUnit: 'km',
    },
  ];

  describe('mapSportNameToId', () => {
    it('maps exact name matches', () => {
      expect(mapSportNameToId('Run', mockSports)).toBe('s3');
    });

    it('maps case-insensitive matches', () => {
      expect(mapSportNameToId('bike', mockSports)).toBe('s2');
    });

    it('maps matches with whitespace', () => {
      expect(mapSportNameToId('  Swim  ', mockSports)).toBe('s1');
    });

    it('returns undefined for no match', () => {
      expect(mapSportNameToId('Yoga', mockSports)).toBeUndefined();
    });
  });

  describe('parseImportData', () => {
    it('successfully parses valid JSON array', async () => {
      const json = JSON.stringify([
        {
          date: '2026-05-01',
          sportName: 'Run',
          title: 'Morning Run',
          plannedDurationMinutes: 45,
        },
      ]);

      const results = await parseImportData(json, 'json', mockSports);
      expect(results).toHaveLength(1);
      expect(results[0].isValid).toBe(true);
      expect(results[0].workout?.sportTypeId).toBe('s3');
      expect(results[0].workout?.title).toBe('Morning Run');
    });

    it('successfully parses valid CSV', async () => {
      const csv =
        'date,sportName,title,plannedDurationMinutes\n2026-05-02,Bike,Long Ride,120';

      const results = await parseImportData(csv, 'csv', mockSports);
      expect(results).toHaveLength(1);
      if (!results[0].isValid) {
        console.log('CSV Parse errors:', results[0].errors);
      }
      expect(results[0].isValid).toBe(true);
      expect(results[0].workout?.sportTypeId).toBe('s2');
      expect(results[0].workout?.plannedDurationMinutes).toBe(120);
    });

    it('handles invalid sport names', async () => {
      const json = JSON.stringify([
        {
          date: '2026-05-01',
          sportName: 'InvalidSport',
          title: 'Title',
          plannedDurationMinutes: 30,
        },
      ]);

      const results = await parseImportData(json, 'json', mockSports);
      expect(results[0].isValid).toBe(false);
      expect(results[0].errors).toContain('Sport "InvalidSport" not found');
    });

    it('handles schema validation errors', async () => {
      const json = JSON.stringify([
        {
          date: 'not-a-date',
          sportName: 'Run',
          title: '', // Empty title
          plannedDurationMinutes: -5, // Invalid duration
        },
      ]);

      const results = await parseImportData(json, 'json', mockSports);
      expect(results[0].isValid).toBe(false);
      expect(results[0].errors).toHaveLength(3);
    });
  });
});
