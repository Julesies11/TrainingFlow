import { SportTypeRecord, UserSportSettings } from '@/types/training';

const FALLBACK_HEX = '#3b82f6';

/**
 * Resolve the effort color for a given sport type and effort level.
 * Priority: user override → system default → fallback blue.
 */
export function getEffortColor(
  sportType: SportTypeRecord | undefined,
  level: number,
  userSettings?: UserSportSettings,
): string {
  // 1. Try user override
  if (userSettings) {
    const userMap: Record<number, string | undefined> = {
      1: userSettings.effort1Hex,
      2: userSettings.effort2Hex,
      3: userSettings.effort3Hex,
      4: userSettings.effort4Hex,
    };
    if (userMap[level]) return userMap[level]!;
  }

  // 2. Fall back to system default from sport_types table
  if (sportType) {
    const sysMap: Record<number, string | undefined> = {
      1: sportType.effort1Hex,
      2: sportType.effort2Hex,
      3: sportType.effort3Hex,
      4: sportType.effort4Hex,
    };
    if (sysMap[level]) return sysMap[level]!;
    // If the requested level has no color, use level 1 as fallback
    if (sportType.effort1Hex) return sportType.effort1Hex;
  }

  return FALLBACK_HEX;
}

/**
 * Get the effort label for a given sport type and effort level.
 * Priority: user override → system default → fallback.
 */
export function getEffortLabel(
  sportType: SportTypeRecord | undefined,
  level: number,
  userSettings?: UserSportSettings,
): string {
  // 1. Try user override
  if (userSettings) {
    const userMap: Record<number, string | undefined> = {
      1: userSettings.effort1Label,
      2: userSettings.effort2Label,
      3: userSettings.effort3Label,
      4: userSettings.effort4Label,
    };
    if (userMap[level]) return userMap[level]!;
  }

  // 2. Fall back to system default from sport_types table
  if (sportType) {
    const sysMap: Record<number, string | undefined> = {
      1: sportType.effort1Label,
      2: sportType.effort2Label,
      3: sportType.effort3Label,
      4: sportType.effort4Label,
    };
    if (sysMap[level]) return sysMap[level]!;
  }

  return `Level ${level}`;
}

/**
 * Build a lookup map: sportTypeId → UserSportSettings
 */
export function buildUserSettingsMap(
  settings: UserSportSettings[],
): Map<string, UserSportSettings> {
  const m = new Map<string, UserSportSettings>();
  settings.forEach((s) => m.set(s.sportTypeId, s));
  return m;
}

/**
 * Build a lookup map: sportTypeId → SportTypeRecord
 */
export function buildSportMap(
  sportTypes: SportTypeRecord[],
): Map<string, SportTypeRecord> {
  const m = new Map<string, SportTypeRecord>();
  sportTypes.forEach((st) => m.set(st.id, st));
  return m;
}
