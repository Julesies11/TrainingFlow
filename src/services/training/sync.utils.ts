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
  // Group existing workouts by date for efficient lookup
  const existingByDate = new Map<string, Workout[]>();
  existingWorkouts.forEach((w) => {
    const list = existingByDate.get(w.date) || [];
    list.push(w);
    existingByDate.set(w.date, list);
  });

  return incoming.map((row) => {
    if (!row.isValid || !row.workout) return row;

    const { date, sportTypeId } = row.workout;
    const garminTimestamp = row.row.actual_datetime;
    const dailyCandidates = existingByDate.get(date!) || [];

    // --- Phase 1: Definitive Link (Re-Sync) ---
    if (garminTimestamp) {
      const definitiveMatch = dailyCandidates.find(
        (w) => w.actual_datetime === garminTimestamp,
      );
      if (definitiveMatch) {
        return mergeWorkout(row, definitiveMatch, 'RE-SYNC');
      }
    }

    // --- Phase 2: Intelligent Pairing (Sync Fallback) ---
    // Only look for un-synced placeholders (no actual_datetime, no performance data)
    const placeholders = dailyCandidates.filter(
      (w) =>
        w.sportTypeId === sportTypeId &&
        !w.actual_datetime &&
        !(w.actualDurationMinutes || w.actualDistanceKilometers || w.actualTSS),
    );

    if (placeholders.length > 0) {
      // Find closest match by duration
      let bestMatch = placeholders[0];
      let minDiff = Math.abs(
        (bestMatch.plannedDurationMinutes || 0) -
          (row.workout.plannedDurationMinutes || 0),
      );

      for (let i = 1; i < placeholders.length; i++) {
        const diff = Math.abs(
          (placeholders[i].plannedDurationMinutes || 0) -
            (row.workout.plannedDurationMinutes || 0),
        );
        if (diff < minDiff) {
          minDiff = diff;
          bestMatch = placeholders[i];
        }
      }

      return mergeWorkout(row, bestMatch, 'SYNC');
    }

    // --- Phase 3: New Activity ---
    return { ...row, syncStatus: 'NEW' };
  });
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
