import Papa from 'papaparse';
import { z } from 'zod';
import { SportTypeRecord, Workout } from '@/types/training';

/**
 * Schema for a single workout row in the import data.
 * This is what the LLM is expected to produce.
 */
export const ImportWorkoutSchema = z
  .object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
      .optional(),
    weekNumber: z.coerce.number().min(1).optional(),
    dayOfWeek: z.coerce.number().min(1).max(7).optional(),
    sportName: z.string().min(1, 'Sport name is required'),
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional().default(''),
    plannedDurationMinutes: z.coerce
      .number()
      .min(1, 'Duration must be at least 1 minute'),
    plannedDistanceKilometers: z.coerce.number().min(0).optional().default(0),
    effortLevel: z.coerce.number().min(1).max(4).optional().default(1),
    isKeyWorkout: z.preprocess((val) => {
      if (typeof val === 'string') {
        const lower = val.toLowerCase().trim();
        return lower === 'true' || lower === '1';
      }
      return Boolean(val);
    }, z.boolean().optional().default(false)),
  })
  .refine(
    (data) =>
      data.date ||
      (data.weekNumber !== undefined && data.dayOfWeek !== undefined),
    {
      message:
        "Either 'date' or both 'weekNumber' and 'dayOfWeek' are required",
    },
  );

export type ImportWorkoutRow = z.infer<typeof ImportWorkoutSchema>;

export interface ProcessedImportRow {
  row: Partial<ImportWorkoutRow & { actual_datetime?: string }>;
  workout?: Partial<Workout & { weekNumber?: number; dayOfWeek?: number }>;
  syncStatus?: 'NEW' | 'SYNC' | 'RE-SYNC';
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
  let csvErrors: Papa.ParseError[] = [];

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
    rawData = result.data as Record<string, unknown>[];
    csvErrors = result.errors;

    // If we have no data at all, it's a fatal structural error
    if (rawData.length === 0 && csvErrors.length > 0) {
      const errorMessages = csvErrors.map((err) => {
        const rowInfo = err.row !== undefined ? ` (row ${err.row + 2})` : '';
        return `${err.message}${rowInfo}`;
      });

      let finalMessage = errorMessages.join('; ');

      // Heuristic for semi-colon delimiter issues
      if (input.includes(';') && !input.includes(',')) {
        finalMessage +=
          '. Tip: It looks like you might be using semi-colons (;) instead of commas (,). Please use standard comma-separated format.';
      }
      throw new Error(`Failed to parse CSV: ${finalMessage}`);
    }
  }

  // Map rows and collect errors
  return rawData.map((raw, idx) => {
    const errors: string[] = [];
    let isValid = true;
    let workout:
      | Partial<Workout & { weekNumber?: number; dayOfWeek?: number }>
      | undefined;

    // Add PapaParse errors for this specific row (if CSV)
    const rowErrors = csvErrors.filter((e) => e.row === idx);
    rowErrors.forEach((err) => {
      let msg = err.message;
      if (err.code === 'TooManyFields') {
        msg =
          'Too many columns detected. If a field (like description) contains a comma, please surround the entire text with double quotes (e.g., "Text, with comma").';
      } else if (err.code === 'TooFewFields') {
        msg =
          'Too few columns detected. Ensure all required columns are present and separated by commas.';
      }
      errors.push(msg);
      isValid = false;
    });

    const zodResult = ImportWorkoutSchema.safeParse(raw);

    if (!zodResult.success) {
      isValid = false;
      zodResult.error.errors.forEach((err) => {
        const field = err.path[0]?.toString() || '';
        const friendlyField = field
          .replace(/([A-Z])/g, ' $1')
          .replace(/^planned\s/, '')
          .toLowerCase();
        errors.push(`${friendlyField}: ${err.message}`);
      });
    }

    const sportNameStr = (raw.sportName as string) || '';
    const sportTypeId = zodResult.success
      ? mapSportNameToId(zodResult.data.sportName, sportTypes)
      : mapSportNameToId(sportNameStr, sportTypes);

    if (!sportTypeId) {
      isValid = false;
      const available = sportTypes.map((st) => st.name).join(', ');
      errors.push(
        `Sport "${sportNameStr || 'unknown'}" not found. Available: ${available}`,
      );
    }

    if (isValid && zodResult.success) {
      workout = {
        date: zodResult.data.date || '',
        weekNumber: zodResult.data.weekNumber,
        dayOfWeek: zodResult.data.dayOfWeek,
        sportTypeId,
        title: zodResult.data.title,
        description: zodResult.data.description,
        plannedDurationMinutes: zodResult.data.plannedDurationMinutes,
        plannedDistanceKilometers: zodResult.data.plannedDistanceKilometers,
        effortLevel: zodResult.data.effortLevel,
        isKeyWorkout: zodResult.data.isKeyWorkout,
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
