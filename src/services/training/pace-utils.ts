/**
 * Data-driven pace/speed calculations.
 * Calculations are now based on paceUnit and distanceUnit rather than hardcoded names.
 */

// Legacy aliases for fallback support
export const SWIM_ALIASES = ['swim', 'swimming'];
export const BIKE_ALIASES = ['bike', 'cycling', 'biking'];
export const RUN_ALIASES = ['run', 'running'];

/**
 * Checks if the sport is swimming based on name or unit.
 */
export function isSwimSport(name?: string, paceUnit?: string): boolean {
  if (paceUnit === 'min/100m') return true;
  if (!name) return false;
  return SWIM_ALIASES.includes(name.trim().toLowerCase());
}

/**
 * Checks if the sport is biking based on name or unit.
 */
export function isBikeSport(name?: string, paceUnit?: string): boolean {
  if (paceUnit === 'km/h') return true;
  if (!name) return false;
  return BIKE_ALIASES.includes(name.trim().toLowerCase());
}

/**
 * Checks if the sport is running based on name or unit.
 */
export function isRunSport(name?: string, paceUnit?: string): boolean {
  if (paceUnit === 'min/km') return true;
  if (!name) return false;
  return RUN_ALIASES.includes(name.trim().toLowerCase());
}

/**
 * Checks if the distance should be treated as meters (requiring conversion from database km).
 */
export function isMetersDistance(
  distanceUnit?: string,
  sportName?: string,
): boolean {
  if (distanceUnit === 'm') return true;
  return isSwimSport(sportName);
}

/**
 * Calculate pace or speed string based on pace unit.
 * @param paceUnit - The unit to calculate for (min/100m, km/h, min/km)
 * @param durationMinutes - Total duration in minutes
 * @param distance - Distance in the display unit (m for Swim, km for Bike/Run)
 * @param sportName - Fallback for legacy support if paceUnit is missing
 * @returns Formatted pace/speed string
 */
export function calculatePace(
  paceUnit: string | undefined,
  durationMinutes: number,
  distance: number,
  sportName?: string,
): string {
  if (durationMinutes <= 0 || distance <= 0) return '';

  // Determine calculation type based on paceUnit or fallback sportName
  const isSwim =
    paceUnit === 'min/100m' || (!paceUnit && isSwimSport(sportName));
  const isBike = paceUnit === 'km/h' || (!paceUnit && isBikeSport(sportName));
  const isRun = paceUnit === 'min/km' || (!paceUnit && isRunSport(sportName));

  if (isSwim) {
    // Pace in min/100m — distance is in meters
    const per100 = durationMinutes / (distance / 100);
    const m = Math.floor(per100);
    const s = Math.round((per100 - m) * 60);
    return `${m}:${s.toString().padStart(2, '0')} /100m`;
  }

  if (isBike) {
    // Speed in km/h — distance is in km
    const kmh = (distance / durationMinutes) * 60;
    return `${kmh.toFixed(1)} km/h`;
  }

  if (isRun) {
    // Pace in min/km — distance is in km
    const perKm = durationMinutes / distance;
    const m = Math.floor(perKm);
    const s = Math.round((perKm - m) * 60);
    return `${m}:${s.toString().padStart(2, '0')} /km`;
  }

  return '';
}

/**
 * Returns the distance unit label for a sport.
 */
export function getDistanceUnit(
  distanceUnit?: string,
  sportName?: string,
): string {
  if (distanceUnit) return distanceUnit;
  if (isSwimSport(sportName)) return 'm';
  if (isBikeSport(sportName) || isRunSport(sportName)) return 'km';
  return '';
}

/**
 * Returns whether a sport tracks pace/distance.
 */
export function isPaceRelevant(
  paceRelevant: boolean,
  paceUnit?: string,
): boolean {
  return paceRelevant || !!paceUnit;
}
