import { Waves, Bike, PersonStanding, Dumbbell, LucideIcon } from 'lucide-react';

/**
 * Get the icon component for a sport name
 * Handles case-insensitive matching
 */
export function getSportIcon(sportName: string | undefined): LucideIcon | null {
  if (!sportName) return null;
  
  const normalized = sportName.toLowerCase().trim();
  
  if (normalized === 'swim' || normalized === 'swimming') return Waves;
  if (normalized === 'bike' || normalized === 'cycling' || normalized === 'biking') return Bike;
  if (normalized === 'run' || normalized === 'running') return PersonStanding;
  if (normalized === 'strength' || normalized === 'weights' || normalized === 'gym') return Dumbbell;
  
  return null;
}
