import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';
import { Workout } from '@/types/training';
import {
  GarminSportMapping,
  SportTypeRecord,
} from '@/types/training/sports.types';
import { parseGarminCSV } from '../garmin.utils';
import { applySmartSync } from '../sync.utils';

describe('applySmartSync with Real File Data', () => {
  const csvPath = path.resolve(__dirname, 'garmin_data_sample.csv');
  const realRawCSV = fs.readFileSync(csvPath, 'utf8');

  const bikeSportId = 's1';
  const runSportId = 's2';

  const mockMappings: GarminSportMapping[] = [
    {
      id: 'm1',
      garminActivityType: 'Cycling',
      sportTypeId: bikeSportId,
      garminDistanceUnit: 'km',
      isSystem: true,
    },
    {
      id: 'm2',
      garminActivityType: 'Running',
      sportTypeId: runSportId,
      garminDistanceUnit: 'km',
      isSystem: true,
    },
  ];

  const mockSportTypes: SportTypeRecord[] = [
    {
      id: bikeSportId,
      name: 'Bike',
      paceRelevant: true,
      paceUnit: 'km/h',
      distanceUnit: 'km',
    },
    {
      id: runSportId,
      name: 'Run',
      paceRelevant: true,
      paceUnit: 'min/km',
      distanceUnit: 'km',
    },
  ];

  it('SYNC: Correctly pairs real Garmin rows to planned placeholders', async () => {
    // 1. Prepare existing placeholders on the calendar
    const mockExisting: Workout[] = [
      {
        id: 'placeholder-ride',
        date: '2026-04-30',
        sportTypeId: bikeSportId,
        title: 'Morning Ride Placeholder',
        description: 'Target 50km',
        plannedDurationMinutes: 120,
        plannedDistanceKilometers: 50,
        effortLevel: 2,
        isKeyWorkout: false,
        intervals: [],
      },
    ];

    // 2. Parse the real CSV
    const incoming = await parseGarminCSV(
      realRawCSV,
      mockMappings,
      mockSportTypes,
      'u1',
    );

    // 3. Apply Sync
    const synced = applySmartSync(incoming, mockExisting);

    // 4. Verify 2026-04-30 ride is matched
    const rideRow = synced.find(
      (r) => r.row.date === '2026-04-30' && r.row.sportName === 'Cycling',
    );
    expect(rideRow?.syncStatus).toBe('SYNC');
    expect(rideRow?.workout?.id).toBe('placeholder-ride');
    expect(rideRow?.workout?.actualDurationMinutes).toBe(115);
    expect(rideRow?.workout?.description).toContain('Imported from Garmin');
  });

  it('RE-SYNC: Definitively links via actual_datetime on second import', async () => {
    const garminTimestamp = '2026-04-28 16:27:15'; // Exact timestamp from Running row

    const mockExisting: Workout[] = [
      {
        id: 'existing-run-id',
        date: '2026-04-28',
        sportTypeId: runSportId,
        title: 'Previously Synced Run',
        description: 'Synced last week',
        actual_datetime: garminTimestamp,
        actualDurationMinutes: 65,
        plannedDurationMinutes: 60,
        plannedDistanceKilometers: 11,
        effortLevel: 2,
        isKeyWorkout: false,
        intervals: [],
      },
    ];

    const incoming = await parseGarminCSV(
      realRawCSV,
      mockMappings,
      mockSportTypes,
      'u1',
    );
    const synced = applySmartSync(incoming, mockExisting);

    const runRow = synced.find(
      (r) => r.row.actual_datetime === garminTimestamp,
    );
    expect(runRow?.syncStatus).toBe('RE-SYNC');
    expect(runRow?.workout?.id).toBe('existing-run-id');
  });

  it('NEW: Creates new record if placeholder sport differs', async () => {
    const mockExisting: Workout[] = [
      {
        id: 'placeholder-swim',
        date: '2026-04-30',
        sportTypeId: 'swim-id', // DIFFERENT SPORT
        title: 'Swim session',
        description: '',
        plannedDurationMinutes: 60,
        plannedDistanceKilometers: 2,
        effortLevel: 2,
        isKeyWorkout: false,
        intervals: [],
      },
    ];

    const incoming = await parseGarminCSV(
      realRawCSV,
      mockMappings,
      mockSportTypes,
      'u1',
    );
    const synced = applySmartSync(incoming, mockExisting);

    // Cycling on 04-30 should be NEW because only a SWIM exists
    const rideRow = synced.find(
      (r) => r.row.date === '2026-04-30' && r.row.sportName === 'Cycling',
    );
    expect(rideRow?.syncStatus).toBe('NEW');
  });
});
