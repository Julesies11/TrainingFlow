import { describe, expect, it } from 'vitest';
import {
  calculatePace,
  getDistanceUnit,
  isBikeSport,
  isMetersDistance,
  isPaceRelevant,
  isRunSport,
  isSwimSport,
} from './pace-utils';

describe('pace-utils', () => {
  describe('isSwimSport', () => {
    it('returns true for swim pace unit', () => {
      expect(isSwimSport('min/100m')).toBe(true);
    });

    it('returns false for other units', () => {
      expect(isSwimSport('min/km')).toBe(false);
      expect(isSwimSport('km/h')).toBe(false);
    });
  });

  describe('isBikeSport', () => {
    it('returns true for bike speed unit', () => {
      expect(isBikeSport('km/h')).toBe(true);
    });

    it('returns false for other units', () => {
      expect(isBikeSport('min/km')).toBe(false);
      expect(isBikeSport('min/100m')).toBe(false);
    });
  });

  describe('isRunSport', () => {
    it('returns true for run pace unit', () => {
      expect(isRunSport('min/km')).toBe(true);
    });

    it('returns false for other units', () => {
      expect(isRunSport('km/h')).toBe(false);
      expect(isRunSport('min/100m')).toBe(false);
    });
  });

  describe('isMetersDistance', () => {
    it('returns true for "m" distance unit', () => {
      expect(isMetersDistance('m')).toBe(true);
    });

    it('returns false for "km" or undefined', () => {
      expect(isMetersDistance('km')).toBe(false);
      expect(isMetersDistance(undefined)).toBe(false);
    });
  });

  describe('calculatePace', () => {
    it('calculates swim pace (min/100m)', () => {
      // 10 mins for 500m = 2:00/100m
      expect(calculatePace('min/100m', 10, 500)).toBe('2:00 /100m');
    });

    it('calculates bike speed (km/h)', () => {
      // 60 mins for 30km = 30.0 km/h
      expect(calculatePace('km/h', 60, 30)).toBe('30.0 km/h');
    });

    it('calculates run pace (min/km)', () => {
      // 50 mins for 10km = 5:00/km
      expect(calculatePace('min/km', 50, 10)).toBe('5:00 /km');
    });

    it('returns empty string for invalid inputs', () => {
      expect(calculatePace('min/km', 0, 10)).toBe('');
      expect(calculatePace('min/km', 50, 0)).toBe('');
      expect(calculatePace(undefined, 50, 10)).toBe('');
    });
  });

  describe('getDistanceUnit', () => {
    it('returns provided distance unit', () => {
      expect(getDistanceUnit('m')).toBe('m');
      expect(getDistanceUnit('km')).toBe('km');
    });

    it('returns empty string if unit is missing', () => {
      expect(getDistanceUnit(undefined)).toBe('');
    });
  });

  describe('isPaceRelevant', () => {
    it('returns true if paceRelevant is true', () => {
      expect(isPaceRelevant(true)).toBe(true);
    });

    it('returns true if paceUnit is provided', () => {
      expect(isPaceRelevant(false, 'min/km')).toBe(true);
    });

    it('returns false if both are missing/false', () => {
      expect(isPaceRelevant(false)).toBe(false);
      expect(isPaceRelevant(false, undefined)).toBe(false);
    });
  });
});
