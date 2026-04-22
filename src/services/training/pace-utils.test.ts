import { describe, expect, it } from 'vitest';
import {
  calculatePace,
  isBikeSport,
  isMetersDistance,
  isPaceRelevant,
  isRunSport,
  isSwimSport,
} from './pace-utils';

describe('pace-utils', () => {
  describe('isSwimSport', () => {
    it('returns true for swim-related names', () => {
      expect(isSwimSport('Swim')).toBe(true);
      expect(isSwimSport('swim')).toBe(true);
      expect(isSwimSport('Swimming')).toBe(true);
      expect(isSwimSport('  swimming  ')).toBe(true);
    });

    it('returns true for swim pace unit', () => {
      expect(isSwimSport(undefined, 'min/100m')).toBe(true);
    });

    it('returns false for non-swim names', () => {
      expect(isSwimSport('Run')).toBe(false);
      expect(isSwimSport('Bike')).toBe(false);
    });
  });

  describe('isBikeSport', () => {
    it('returns true for bike-related names', () => {
      expect(isBikeSport('Bike')).toBe(true);
      expect(isBikeSport('cycling')).toBe(true);
      expect(isBikeSport('biking')).toBe(true);
    });

    it('returns true for bike speed unit', () => {
      expect(isBikeSport(undefined, 'km/h')).toBe(true);
    });
  });

  describe('isRunSport', () => {
    it('returns true for run-related names', () => {
      expect(isRunSport('Run')).toBe(true);
      expect(isRunSport('running')).toBe(true);
    });

    it('returns true for run pace unit', () => {
      expect(isRunSport(undefined, 'min/km')).toBe(true);
    });
  });

  describe('isMetersDistance', () => {
    it('returns true for distanceUnit "m"', () => {
      expect(isMetersDistance('m')).toBe(true);
    });

    it('returns true for swim sport name fallback', () => {
      expect(isMetersDistance(undefined, 'Swim')).toBe(true);
    });

    it('returns false for "km"', () => {
      expect(isMetersDistance('km')).toBe(false);
    });
  });

  describe('calculatePace', () => {
    it('calculates swim pace (min/100m)', () => {
      // 10 mins for 500m = 2:00/100m
      expect(calculatePace('min/100m', 10, 500)).toBe('2:00 /100m');
      // 1:30 pace for 1000m = 15 mins
      expect(calculatePace('min/100m', 15, 1000)).toBe('1:30 /100m');
    });

    it('calculates bike speed (km/h)', () => {
      // 30km in 60 mins = 30.0 km/h
      expect(calculatePace('km/h', 60, 30)).toBe('30.0 km/h');
      // 20km in 45 mins = 26.7 km/h
      expect(calculatePace('km/h', 45, 20)).toBe('26.7 km/h');
    });

    it('calculates run pace (min/km)', () => {
      // 10km in 50 mins = 5:00/km
      expect(calculatePace('min/km', 50, 10)).toBe('5:00 /km');
      // 5km in 22.5 mins = 4:30/km
      expect(calculatePace('min/km', 22.5, 5)).toBe('4:30 /km');
    });

    it('handles legacy sport name fallback if unit is missing', () => {
      expect(calculatePace(undefined, 10, 500, 'Swim')).toBe('2:00 /100m');
    });

    it('returns empty string for invalid inputs', () => {
      expect(calculatePace('min/km', 0, 10)).toBe('');
      expect(calculatePace('min/km', 50, 0)).toBe('');
    });
  });

  describe('isPaceRelevant', () => {
    it('returns true if paceRelevant is true', () => {
      expect(isPaceRelevant(true)).toBe(true);
    });

    it('returns true if paceUnit is provided', () => {
      expect(isPaceRelevant(false, 'min/km')).toBe(true);
    });

    it('returns false if neither provided', () => {
      expect(isPaceRelevant(false, undefined)).toBe(false);
    });
  });
});
