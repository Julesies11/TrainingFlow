import { Bike, Dumbbell, Footprints, LucideIcon, Waves } from 'lucide-react';
import { isBikeSport, isRunSport, isSwimSport } from './pace-utils';

/**
 * Get the icon component for a sport name
 * Handles case-insensitive matching
 */
export function getSportIcon(sportName: string | undefined): LucideIcon | null {
  if (!sportName) return null;

  if (isSwimSport(sportName)) return Waves;
  if (isBikeSport(sportName)) return Bike;
  if (isRunSport(sportName)) return Footprints;

  const normalized = sportName.toLowerCase().trim();
  if (
    normalized === 'strength' ||
    normalized === 'weights' ||
    normalized === 'gym'
  )
    return Dumbbell;

  return null;
}
