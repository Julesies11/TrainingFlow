import { describe, expect, it } from 'vitest';
import { GarminSportMapping } from '@/types/training';
import { resolveGarminMapping } from '../garmin.utils';

describe('resolveGarminMapping Precedence', () => {
  const mockMappings: GarminSportMapping[] = [
    {
      id: 'system-1',
      garminActivityType: 'Running',
      sportTypeId: 'run-system-id',
      isSystem: true,
      garminDistanceUnit: 'km',
    },
    {
      id: 'custom-1',
      garminActivityType: 'Running',
      sportTypeId: 'run-custom-id',
      userId: 'user-123',
      isSystem: false,
      garminDistanceUnit: 'km',
    },
    {
      id: 'system-2',
      garminActivityType: 'Cycling',
      sportTypeId: 'bike-system-id',
      isSystem: true,
      garminDistanceUnit: 'km',
    },
  ];

  it('prioritizes custom mappings over system mappings for the same type', () => {
    const result = resolveGarminMapping('Running', mockMappings, 'user-123');
    expect(result?.id).toBe('custom-1');
    expect(result?.sportTypeId).toBe('run-custom-id');
  });

  it('falls back to system mapping if no custom mapping exists', () => {
    const result = resolveGarminMapping('Cycling', mockMappings, 'user-123');
    expect(result?.id).toBe('system-2');
  });

  it('returns system mapping for other users if they have no custom mapping', () => {
    const result = resolveGarminMapping('Running', mockMappings, 'user-456');
    expect(result?.id).toBe('system-1');
  });

  it('handles case insensitivity', () => {
    const result = resolveGarminMapping('running', mockMappings, 'user-123');
    expect(result?.id).toBe('custom-1');
  });

  it('returns undefined for unmapped types', () => {
    const result = resolveGarminMapping('Skydiving', mockMappings, 'user-123');
    expect(result).toBeUndefined();
  });
});
