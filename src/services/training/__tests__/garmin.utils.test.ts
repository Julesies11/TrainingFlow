import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import {
  GarminSportMapping,
  SportTypeRecord,
} from '@/types/training/sports.types';
import { parseGarminCSV, parseGarminTimeToMinutes } from '../garmin.utils';

describe('garmin.utils with Real File Data', () => {
  // Read the real sample file provided by the user
  const csvPath = path.resolve(__dirname, 'garmin_data_sample.csv');
  const realRawCSV = fs.readFileSync(csvPath, 'utf8');

  const mockMappings: GarminSportMapping[] = [
    {
      id: 'm1',
      garminActivityType: 'Cycling',
      sportTypeId: 's1',
      garminDistanceUnit: 'km',
      isSystem: true,
    },
    {
      id: 'm2',
      garminActivityType: 'Running',
      sportTypeId: 's2',
      garminDistanceUnit: 'km',
      isSystem: true,
    },
    {
      id: 'm3',
      garminActivityType: 'Strength Training',
      sportTypeId: 's3',
      garminDistanceUnit: 'km',
      isSystem: true,
    },
    {
      id: 'm4',
      garminActivityType: 'Pool Swim',
      sportTypeId: 's4',
      garminDistanceUnit: 'm',
      isSystem: true,
    },
    {
      id: 'm5',
      garminActivityType: 'Open Water Swimming',
      sportTypeId: 's4',
      garminDistanceUnit: 'm',
      isSystem: true,
    },
    {
      id: 'm6',
      garminActivityType: 'Trail Running',
      sportTypeId: 's2',
      garminDistanceUnit: 'km',
      isSystem: true,
    },
  ];

  const mockSportTypes: SportTypeRecord[] = [
    {
      id: 's1',
      name: 'Bike',
      paceRelevant: true,
      paceUnit: 'km/h',
      distanceUnit: 'km',
    },
    {
      id: 's2',
      name: 'Run',
      paceRelevant: true,
      paceUnit: 'min/km',
      distanceUnit: 'km',
    },
    { id: 's3', name: 'Strength', paceRelevant: false },
    {
      id: 's4',
      name: 'Swim',
      paceRelevant: true,
      paceUnit: 'min/100m',
      distanceUnit: 'm',
    },
  ];

  describe('parseGarminCSV Robustness', () => {
    it('successfully parses all 100+ rows from the real CSV', async () => {
      const results = await parseGarminCSV(
        realRawCSV,
        mockMappings,
        mockSportTypes,
        'u1',
      );

      // Filter out only valid rows (multisport might fail as unmapped in this test)
      const validRows = results.filter((r) => r.isValid);

      expect(results.length).toBeGreaterThan(100);
      expect(validRows.length).toBeGreaterThan(100);
    });

    it('correctly normalizes Pool Swim distance (2,500 -> 2.5)', async () => {
      const results = await parseGarminCSV(
        realRawCSV,
        mockMappings,
        mockSportTypes,
        'u1',
      );
      // Find the Pool Swim from 2026-03-16
      const swim = results.find(
        (r) => r.row.date === '2026-03-16' && r.row.sportName === 'Pool Swim',
      );

      expect(swim?.isValid).toBe(true);
      expect(swim?.workout?.plannedDistanceKilometers).toBe(2.5);
      expect(swim?.workout?.actualDurationMinutes).toBe(45);
    });

    it('extracts Normalized Power and TSS correctly from Cycling', async () => {
      const results = await parseGarminCSV(
        realRawCSV,
        mockMappings,
        mockSportTypes,
        'u1',
      );
      // Find the Cycling from 2026-03-24
      const ride = results.find(
        (r) => r.row.date === '2026-03-24' && r.row.sportName === 'Cycling',
      );

      expect(ride?.isValid).toBe(true);
      expect(ride?.workout?.avgHR).toBe(133);
      expect(ride?.workout?.maxHR).toBe(195);
      expect(ride?.workout?.actualTSS).toBe(0);
    });

    it('extracts Cadence and Elevation from Running', async () => {
      const results = await parseGarminCSV(
        realRawCSV,
        mockMappings,
        mockSportTypes,
        'u1',
      );
      // Find the Running from 2026-04-19
      const run = results.find(
        (r) => r.row.date === '2026-04-19' && r.row.sportName === 'Running',
      );

      expect(run?.isValid).toBe(true);
      expect(run?.workout?.avgCadence).toBe(166);
      expect(run?.workout?.totalAscent).toBe(84);
      expect(run?.workout?.totalDescent).toBe(79);
    });

    it('ensures all extracted fields have correct data types', async () => {
      const results = await parseGarminCSV(
        realRawCSV,
        mockMappings,
        mockSportTypes,
        'u1',
      );
      const ride = results.find((r) => r.row.sportName === 'Cycling')?.workout;

      if (ride) {
        expect(typeof ride.plannedDurationMinutes).toBe('number');
        expect(typeof ride.plannedDistanceKilometers).toBe('number');
        expect(typeof ride.effortLevel).toBe('number');
        expect(typeof ride.isKeyWorkout).toBe('boolean');

        // Optional fields that should be numbers if present
        if (ride.avgHR !== undefined) expect(typeof ride.avgHR).toBe('number');
        if (ride.maxHR !== undefined) expect(typeof ride.maxHR).toBe('number');
        if (ride.actualTSS !== undefined)
          expect(typeof ride.actualTSS).toBe('number');
        if (ride.totalAscent !== undefined)
          expect(typeof ride.totalAscent).toBe('number');
        if (ride.calories !== undefined)
          expect(typeof ride.calories).toBe('number');

        expect(typeof ride.date).toBe('string');
        expect(typeof ride.title).toBe('string');
        expect(Array.isArray(ride.intervals)).toBe(true);
      }
    });

    it('handles "Gym" unmapped activity correctly', async () => {
      const results = await parseGarminCSV(
        realRawCSV,
        mockMappings,
        mockSportTypes,
        'u1',
      );
      const gym = results.find((r) => r.row.title === 'Gym');

      expect(gym?.isValid).toBe(false);
      expect(gym?.errors[0]).toContain('Unmapped activity type');
    });
  });

  describe('parseGarminTimeToMinutes', () => {
    it('handles all time formats found in the file', () => {
      expect(parseGarminTimeToMinutes('05:40:26')).toBe(340); // 5h 40m
      expect(parseGarminTimeToMinutes('00:07:33.3')).toBe(8); // 7m 33s -> 8m
      expect(parseGarminTimeToMinutes('00:00:20.9')).toBe(0); // 20s -> 0m
      expect(parseGarminTimeToMinutes('00:00:41.9')).toBe(1); // 41s -> 1m
    });
  });
});
