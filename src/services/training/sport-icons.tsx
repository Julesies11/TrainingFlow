import { Bike, Dumbbell, Footprints, LucideIcon, Waves } from 'lucide-react';

/**
 * Get the icon component based on sport properties
 */
export function getSportIcon(
  sportName: string | undefined,
  paceUnit?: string,
): LucideIcon | null {
  if (paceUnit === 'min/100m') return Waves;
  if (paceUnit === 'km/h') return Bike;
  if (paceUnit === 'min/km') return Footprints;

  // Strength/Gym doesn't have a standardized unit yet,
  // so we use a very limited name check as a last resort
  // or a default icon.
  const normalized = sportName?.toLowerCase().trim() || '';
  if (
    normalized === 'strength' ||
    normalized === 'weights' ||
    normalized === 'gym'
  )
    return Dumbbell;

  return null;
}
