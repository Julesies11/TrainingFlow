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

  it('BEST-FIT: Correctly pairs the closest match when multiple activities exist on the same day', async () => {
    // 1. One existing placeholder on 2026-05-10 for 45 mins
    const mockExisting: Workout[] = [
      {
        id: 'placeholder-run-45',
        date: '2026-05-10',
        sportTypeId: runSportId,
        title: 'Target 45min Run',
        description: '',
        plannedDurationMinutes: 45,
        plannedDistanceKilometers: 8,
        effortLevel: 2,
        isKeyWorkout: false,
        intervals: [],
      },
    ];

    // 2. Real Garmin data provided by user (45 min run and 17 min run)
    const userCSV = `Activity Type,Date,Favorite,Title,Distance,Calories,Time,Avg HR,Max HR,Aerobic TE,Avg Run Cadence,Max Run Cadence,Avg Pace,Best Pace,Total Ascent,Total Descent,Avg Stride Length,Avg Vertical Ratio,Avg Vertical Oscillation,Avg Ground Contact Time,Avg GCT Balance,Avg GAP,Normalized Power® (NP®),Training Stress Score®,Avg Power,Max Power,Total Strokes,Avg. Swolf,Avg Stroke Rate,Steps,Total Reps,Total Sets,Body Battery Drain,Min Temp,Decompression,Best Lap Time,Number of Laps,Max Temp,Avg Resp,Min Resp,Max Resp,Moving Time,Elapsed Time,Min Elevation,Max Elevation
Running,2026-05-10 10:35:22,FALSE,Perth Running,8.16,584,00:45:03,129,143,2.7,163,244,5:31,3:36,--,--,1.12,8.3,9.1,266,--,--,345,0.0,343,507,--,--,--,7496,--,--,-11,--,No,00:45:03,1,--,--,--,--,00:44:49,00:55:39,--,--
Running,2026-05-10 10:11:03,FALSE,Perth Running,2.99,201,00:16:43,118,134,1.8,163,177,5:35,4:49,--,--,1.10,8.5,9.2,270,--,18:09,325,0.0,319,463,--,--,--,2762,--,--,-4,--,No,00:16:43,1,--,--,--,--,00:16:43,00:18:43,--,--`;

    const incoming = await parseGarminCSV(
      userCSV,
      mockMappings,
      mockSportTypes,
      'u1',
    );

    // 3. Apply Sync
    const synced = applySmartSync(incoming, mockExisting);

    // 4. Verify results
    const longRun = synced.find(
      (r) => r.row.actual_datetime === '2026-05-10 10:35:22',
    );
    const shortRun = synced.find(
      (r) => r.row.actual_datetime === '2026-05-10 10:11:03',
    );

    // The long run (45:03) should match the 45min placeholder
    expect(longRun?.syncStatus).toBe('SYNC');
    expect(longRun?.workout?.id).toBe('placeholder-run-45');

    // The short run (16:43) should be NEW
    expect(shortRun?.syncStatus).toBe('NEW');
    expect(shortRun?.workout?.id).not.toBe('placeholder-run-45');
  });

  it('EDGE CASE: Handles empty inputs gracefully', () => {
    const synced = applySmartSync([], []);
    expect(synced).toEqual([]);
  });

  it('EDGE CASE: All incoming are NEW when no placeholders exist', () => {
    const incoming: ProcessedImportRow[] = [
      {
        row: { date: '2026-05-10', sportName: 'Running' },
        workout: {
          date: '2026-05-10',
          sportTypeId: runSportId,
          title: 'Run 1',
        },
        errors: [],
        isValid: true,
      },
    ];
    const synced = applySmartSync(incoming, []);
    expect(synced[0].syncStatus).toBe('NEW');
    expect(synced[0].workout?.id).toBeUndefined();
  });

  it('SCORING: Correctly prioritizes duration over distance for SYNC', () => {
    const mockExisting: Workout[] = [
      {
        id: 'dist-match-but-dur-off',
        date: '2026-05-10',
        sportTypeId: runSportId,
        plannedDurationMinutes: 60,
        plannedDistanceKilometers: 10,
        title: 'Run A',
        description: '',
        effortLevel: 2,
        isKeyWorkout: false,
        intervals: [],
      },
      {
        id: 'dur-match-but-dist-off',
        date: '2026-05-10',
        sportTypeId: runSportId,
        plannedDurationMinutes: 30,
        plannedDistanceKilometers: 20,
        title: 'Run B',
        description: '',
        effortLevel: 2,
        isKeyWorkout: false,
        intervals: [],
      },
    ];

    const incoming: ProcessedImportRow[] = [
      {
        row: { date: '2026-05-10' },
        workout: {
          date: '2026-05-10',
          sportTypeId: runSportId,
          plannedDurationMinutes: 30, // Matches Run B on duration
          plannedDistanceKilometers: 5,
        },
        errors: [],
        isValid: true,
      },
    ];

    const synced = applySmartSync(incoming, mockExisting);
    // Should match 'dur-match-but-dist-off' because duration diff (0) is prioritized
    // over distance diff (Run A dist diff is 5, Run B dist diff is 15).
    // Our score is (durDiff * 100) + distDiff.
    // Pair A: (30 * 100) + 5 = 3005
    // Pair B: (0 * 100) + 15 = 15
    expect(synced[0].workout?.id).toBe('dur-match-but-dist-off');
  });
});
