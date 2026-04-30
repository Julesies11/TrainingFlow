import Papa from 'papaparse';
import { Workout } from '@/types/training';
import {
  GarminSportMapping,
  SportTypeRecord,
} from '@/types/training/sports.types';
import { ProcessedImportRow } from './import.utils';

/**
 * Parses Garmin HH:MM:SS format to minutes
 */
export function parseGarminTimeToMinutes(timeStr: string): number {
  if (!timeStr || timeStr === '--') return 0;

  // Handle formats like "01:05:01" or "00:37:05" or even "00:02:18.7"
  const parts = timeStr.split(':');
  if (parts.length < 2) return 0;

  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  if (parts.length === 3) {
    hours = parseInt(parts[0], 10) || 0;
    minutes = parseInt(parts[1], 10) || 0;
    seconds = parseFloat(parts[2]) || 0;
  } else if (parts.length === 2) {
    minutes = parseInt(parts[0], 10) || 0;
    seconds = parseFloat(parts[1]) || 0;
  }

  return hours * 60 + minutes + Math.round(seconds / 60);
}

/**
 * Resolves Garmin Activity Type to Sport Type ID using mappings
 */
export function resolveGarminSportType(
  garminType: string,
  mappings: GarminSportMapping[],
  userId: string | undefined,
): string | undefined {
  // 1. Check user-specific mappings first
  if (userId) {
    const userMatch = mappings.find(
      (m) =>
        m.garminActivityType.toLowerCase() === garminType.toLowerCase() &&
        m.userId === userId,
    );
    if (userMatch) return userMatch.sportTypeId;
  }

  // 2. Fallback to system mappings
  const systemMatch = mappings.find(
    (m) =>
      m.garminActivityType.toLowerCase() === garminType.toLowerCase() &&
      m.isSystem,
  );
  return systemMatch?.sportTypeId;
}

/**
 * Parses Garmin CSV data
 */
export async function parseGarminCSV(
  csvText: string,
  mappings: GarminSportMapping[],
  sportTypes: SportTypeRecord[],
  userId: string | undefined,
): Promise<ProcessedImportRow[]> {
  const result = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  if (result.errors.length > 0 && result.data.length === 0) {
    throw new Error('Failed to parse Garmin CSV');
  }

  const rawData = result.data as Record<string, string>[];

  return rawData.map((raw) => {
    const errors: string[] = [];
    let isValid = true;
    let workout: Partial<Workout> | undefined;

    // Map Garmin headers to our internal structure
    const garminType = raw['Activity Type'] || '';
    const rawDate = raw['Date'] || '';
    const rawTime = raw['Time'] || raw['Moving Time'] || '00:00:00';
    const rawDistance = raw['Distance'] || '0';
    const title = raw['Title'] || garminType;

    // 1. Process Date (YYYY-MM-DD HH:MM:SS -> YYYY-MM-DD)
    const date = rawDate.split(' ')[0];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      isValid = false;
      errors.push(`Invalid date format: ${rawDate}`);
    }

    // 2. Process Sport Type
    const sportTypeId = resolveGarminSportType(garminType, mappings, userId);
    if (!sportTypeId) {
      isValid = false;
      errors.push(`Unmapped activity type: ${garminType}`);
    }

    // 3. Process Duration
    const duration = parseGarminTimeToMinutes(rawTime);
    if (duration <= 0 && garminType !== 'Strength Training') {
      // Strength training might have 0 distance/time in some exports?
      // But usually we want at least 1 min.
    }

    // 4. Process Distance
    const distance = parseFloat(rawDistance.replace(',', '')) || 0;

    if (isValid) {
      workout = {
        date,
        sportTypeId: sportTypeId!,
        title,
        description: `Imported from Garmin. Calories: ${raw['Calories'] || '--'}`,
        plannedDurationMinutes: duration || 1, // Default to 1 if 0
        plannedDistanceKilometers: distance,
        actualDurationMinutes: duration || 1,
        actualDistanceKilometers: distance,
        effortLevel: 1, // Default to recovery/base
        isKeyWorkout: false,
        isCompleted: true, // Garmin imports are COMPLETED activities
        intervals: [],
      };
    }

    return {
      row: {
        date,
        sportName: garminType,
        title,
        plannedDurationMinutes: duration,
        plannedDistanceKilometers: distance,
      },
      workout,
      errors,
      isValid,
    };
  });
}
