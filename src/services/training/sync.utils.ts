import { format } from 'date-fns';
import { Workout } from '@/types/training';
import { ProcessedImportRow } from './import.utils';

/**
 * Intelligent Sync & Link Engine
 * Matches incoming Garmin activities to existing calendar workouts.
 */
export function applySmartSync(
  incoming: ProcessedImportRow[],
  existingWorkouts: Workout[],
): ProcessedImportRow[] {
  // 1. Group existing workouts by date for efficient lookup
  const existingByDate = new Map<string, Workout[]>();
  existingWorkouts.forEach((w) => {
    const list = existingByDate.get(w.date) || [];
    list.push(w);
    existingByDate.set(w.date, list);
  });

  // 2. Prepare results array (defaulting to NEW)
  const results: ProcessedImportRow[] = incoming.map((row) => ({
    ...row,
    syncStatus: 'NEW',
  }));

  // 3. Group valid incoming rows by date to process day-by-day
  const incomingByDate = new Map<string, number[]>();
  incoming.forEach((row, index) => {
    if (!row.isValid || !row.workout) return;
    const date = row.workout.date;
    if (!date) return;
    const list = incomingByDate.get(date) || [];
    list.push(index);
    incomingByDate.set(date, list);
  });

  // 4. Process each date independently
  for (const [date, dailyIncomingIndices] of incomingByDate.entries()) {
    const dailyExisting = existingByDate.get(date) || [];
    const consumedExistingIds = new Set<string>();
    const consumedIncomingIndices = new Set<number>();

    // Pass 1: Definitive Link (Re-Sync) via actual_datetime
    dailyIncomingIndices.forEach((idx) => {
      const inc = incoming[idx];
      const garminTimestamp = inc.row.actual_datetime;
      if (!garminTimestamp) return;

      const definitiveMatch = dailyExisting.find(
        (w) =>
          w.actual_datetime === garminTimestamp &&
          !consumedExistingIds.has(w.id),
      );

      if (definitiveMatch) {
        results[idx] = mergeWorkout(inc, definitiveMatch, 'RE-SYNC');
        consumedExistingIds.add(definitiveMatch.id);
        consumedIncomingIndices.add(idx);
      }
    });

    // Pass 2: Intelligent Pairing (Sync Fallback) using best-fit
    const potentialPairs: { incIdx: number; ext: Workout; score: number }[] =
      [];

    dailyIncomingIndices.forEach((idx) => {
      if (consumedIncomingIndices.has(idx)) return;
      const inc = incoming[idx];

      dailyExisting.forEach((ext) => {
        if (consumedExistingIds.has(ext.id)) return;

        // Eligibility: Same sport and is a placeholder (no actual data)
        const isPlaceholder =
          !ext.actual_datetime &&
          !(
            ext.actualDurationMinutes ||
            ext.actualDistanceKilometers ||
            ext.actualTSS
          );

        if (ext.sportTypeId === inc.workout!.sportTypeId && isPlaceholder) {
          // Calculate score (lower is better)
          const durDiff = Math.abs(
            (ext.plannedDurationMinutes || 0) -
              (inc.workout!.plannedDurationMinutes || 0),
          );
          const distDiff = Math.abs(
            (ext.plannedDistanceKilometers || 0) -
              (inc.workout!.plannedDistanceKilometers || 0),
          );

          // Score weight: Duration is primary, Distance is secondary
          const score = durDiff * 100 + distDiff;
          potentialPairs.push({ incIdx: idx, ext, score });
        }
      });
    });

    // Sort all potential pairs by score
    potentialPairs.sort((a, b) => a.score - b.score);

    // Pair them up greedily starting from best matches
    potentialPairs.forEach((pair) => {
      if (
        consumedIncomingIndices.has(pair.incIdx) ||
        consumedExistingIds.has(pair.ext.id)
      ) {
        return;
      }

      results[pair.incIdx] = mergeWorkout(
        incoming[pair.incIdx],
        pair.ext,
        'SYNC',
      );
      consumedIncomingIndices.add(pair.incIdx);
      consumedExistingIds.add(pair.ext.id);
    });
  }

  return results;
}

/**
 * Merges Garmin data into an existing workout
 */
function mergeWorkout(
  row: ProcessedImportRow,
  existing: Workout,
  status: 'SYNC' | 'RE-SYNC',
): ProcessedImportRow {
  const syncDate = format(new Date(), 'yyyy-MM-dd');
  const syncNote = `Imported from Garmin on ${syncDate}`;

  const baseDescription = (existing.description || '').trim();
  const description = baseDescription.includes(syncNote)
    ? baseDescription
    : baseDescription
      ? `${baseDescription}\n\n${syncNote}`
      : syncNote;

  return {
    ...row,
    syncStatus: status,
    workout: {
      ...row.workout,
      id: existing.id, // CRITICAL: This enables upsert
      description: description,
      // We keep existing effortLevel if it was planned,
      // but update everything else from Garmin
      effortLevel: existing.effortLevel,
      order: existing.order,
      recurrenceId: existing.recurrenceId,
      recurrenceRule: existing.recurrenceRule,
    },
  };
}
