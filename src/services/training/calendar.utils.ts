import { SportTypeRecord } from '@/types/training';
import { isBikeSport, isRunSport, isSwimSport } from './pace-utils';

export function formatDateToLocalISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - (day === 0 ? 6 : day - 1);
  const result = new Date(date.setDate(diff));
  result.setHours(0, 0, 0, 0);
  return result;
}

export function formatMinsShort(totalMins: number): string {
  const roundedMins = Math.round(totalMins);
  if (roundedMins <= 0) return '0m';
  const h = Math.floor(roundedMins / 60);
  const m = roundedMins % 60;
  if (h > 0) return `${h}h ${m > 0 ? m + 'm' : ''}`.trim();
  return `${m}m`;
}

export function getContrastColor(hex: string): string {
  if (!hex) return 'text-foreground';
  const r = parseInt(hex.substring(1, 3), 16);
  const g = parseInt(hex.substring(3, 5), 16);
  const b = parseInt(hex.substring(5, 7), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? 'text-gray-900' : 'text-white';
}

export function getWorkoutPace(
  sport: SportTypeRecord | undefined,
  durationMinutes: number,
  distanceKm: number,
): string {
  if (!sport || distanceKm <= 0 || durationMinutes <= 0) return '';
  if (isSwimSport(sport.paceUnit)) {
    const per100m = (durationMinutes * 60) / (distanceKm * 10);
    const mins = Math.floor(per100m / 60);
    const secs = Math.round(per100m % 60);
    return `${mins}:${String(secs).padStart(2, '0')}/100m`;
  }
  if (isRunSport(sport.paceUnit)) {
    const perKm = durationMinutes / distanceKm;
    const mins = Math.floor(perKm);
    const secs = Math.round((perKm - mins) * 60);
    return `${mins}:${String(secs).padStart(2, '0')}/km`;
  }
  if (isBikeSport(sport.paceUnit)) {
    const speed = distanceKm / (durationMinutes / 60);
    return `${speed.toFixed(1)} km/h`;
  }
  return '';
}

export const MONTH_NAMES = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
];

export const DAY_HEADERS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
