/**
 * Hardcoded pace/speed calculations per sport type.
 * Each sport has its own formula and display format.
 */

/**
 * Calculate pace or speed string for a given sport.
 * @param sportName - The system sport name (Swim, Bike, Run, Strength)
 * @param durationMinutes - Total duration in minutes
 * @param distance - Distance in the sport's native unit (m for Swim, km for Bike/Run)
 * @returns Formatted pace/speed string, or empty string if not applicable
 */
export function calculatePace(
  sportName: string,
  durationMinutes: number,
  distance: number,
): string {
  if (durationMinutes <= 0 || distance <= 0) return '';

  switch (sportName) {
    case 'Swim': {
      // Pace in min/100m — distance is in meters
      const per100 = durationMinutes / (distance / 100);
      const m = Math.floor(per100);
      const s = Math.round((per100 - m) * 60);
      return `${m}:${s.toString().padStart(2, '0')} /100m`;
    }

    case 'Bike': {
      // Speed in km/h — distance is in km
      const kmh = (distance / durationMinutes) * 60;
      return `${kmh.toFixed(1)} km/h`;
    }

    case 'Run': {
      // Pace in min/km — distance is in km
      const perKm = durationMinutes / distance;
      const m = Math.floor(perKm);
      const s = Math.round((perKm - m) * 60);
      return `${m}:${s.toString().padStart(2, '0')} /km`;
    }

    default:
      return '';
  }
}

/**
 * Returns the distance unit label for a sport.
 */
export function getDistanceUnit(sportName: string): string {
  switch (sportName) {
    case 'Swim':
      return 'm';
    case 'Bike':
    case 'Run':
      return 'km';
    default:
      return '';
  }
}

/**
 * Returns whether a sport tracks pace/distance.
 */
export function isPaceRelevant(sportName: string): boolean {
  return sportName === 'Swim' || sportName === 'Bike' || sportName === 'Run';
}
