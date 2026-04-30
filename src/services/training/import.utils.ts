import Papa from 'papaparse';
import { z } from 'zod';
import { SportTypeRecord, Workout } from '@/types/training';

/**
 * Schema for a single workout row in the import data.
 * This is what the LLM is expected to produce.
 */
export const ImportWorkoutSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  sportName: z.string().min(1, 'Sport name is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().default(''),
  plannedDurationMinutes: z.coerce
    .number()
    .min(1, 'Duration must be at least 1 minute'),
  plannedDistanceKilometers: z.coerce.number().min(0).optional().default(0),
  effortLevel: z.coerce.number().min(1).max(4).optional().default(1),
  isKeyWorkout: z.coerce.boolean().optional().default(false),
});

export type ImportWorkoutRow = z.infer<typeof ImportWorkoutSchema>;

export interface ProcessedImportRow {
  row: Partial<ImportWorkoutRow>;
  workout?: Partial<Workout>;
  errors: string[];
  isValid: boolean;
}

/**
 * Maps string sport names to their corresponding record IDs.
 */
export function mapSportNameToId(
  sportName: string,
  sportTypes: SportTypeRecord[],
): string | undefined {
  const normalized = sportName.toLowerCase().trim();
  const match = sportTypes.find(
    (st) =>
      st.name.toLowerCase() === normalized ||
      st.id.toLowerCase() === normalized,
  );
  return match?.id;
}

/**
 * Parses and validates raw input data (JSON or CSV).
 */
export async function parseImportData(
  input: string,
  type: 'json' | 'csv',
  sportTypes: SportTypeRecord[],
): Promise<ProcessedImportRow[]> {
  let rawData: Record<string, unknown>[] = [];

  if (type === 'json') {
    try {
      const parsed = JSON.parse(input);
      rawData = Array.isArray(parsed)
        ? (parsed as Record<string, unknown>[])
        : [parsed as Record<string, unknown>];
    } catch {
      throw new Error('Invalid JSON format');
    }
  } else {
    const result = Papa.parse(input, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
    });

    if (result.errors.length > 0) {
      const errorMessages = result.errors.map((err) => {
        const rowInfo = err.row !== undefined ? ` (row ${err.row + 2})` : '';
        return `${err.message}${rowInfo}`;
      });

      let finalMessage = errorMessages.join('; ');

      // Heuristic for semi-colon delimiter issues
      if (input.includes(';') && !input.includes(',')) {
        finalMessage +=
          '. Tip: It looks like you might be using semi-colons (;) instead of commas (,). Please use standard comma-separated format.';
      }

      // If we have no data at all, it's a fatal structural error
      if (result.data.length === 0) {
        throw new Error(`Failed to parse CSV: ${finalMessage}`);
      }

      throw new Error(`CSV formatting errors found: ${finalMessage}`);
    }

    rawData = result.data as Record<string, unknown>[];
  }

  return rawData.map((raw) => {
    const errors: string[] = [];
    let isValid = true;
    let workout: Partial<Workout> | undefined;

    const result = ImportWorkoutSchema.safeParse(raw);

    if (!result.success) {
      isValid = false;
      result.error.errors.forEach((err) => {
        errors.push(`${err.path.join('.')}: ${err.message}`);
      });
    }

    const sportTypeId = result.success
      ? mapSportNameToId(result.data.sportName, sportTypes)
      : mapSportNameToId(raw.sportName || '', sportTypes);

    if (!sportTypeId) {
      isValid = false;
      errors.push(`Sport "${raw.sportName || 'unknown'}" not found`);
    }

    if (isValid && result.success) {
      workout = {
        date: result.data.date,
        sportTypeId,
        title: result.data.title,
        description: result.data.description,
        plannedDurationMinutes: result.data.plannedDurationMinutes,
        plannedDistanceKilometers: result.data.plannedDistanceKilometers,
        effortLevel: result.data.effortLevel,
        isKeyWorkout: result.data.isKeyWorkout,
        isCompleted: false,
        intervals: [],
      };
    }

    return {
      row: raw,
      workout,
      errors,
      isValid,
    };
  });
}
