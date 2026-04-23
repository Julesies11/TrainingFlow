import { Flag, Info, Target, Trophy } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import { EVENT_THEMES, getEventTypeTheme } from './event-theme';

describe('event-theme utility', () => {
  it('returns the default theme for unknown values', () => {
    const theme = getEventTypeTheme('invalid', 'InvalidIcon');
    expect(theme.hex).toBe('#6b7280');
    expect(theme.icon).toBe(Info);
    expect(theme.bg).toBe('bg-gray-50');
  });

  it('resolves system default themes correctly', () => {
    // Race (afternoon/orange)
    const raceTheme = getEventTypeTheme('afternoon', 'Flag');
    expect(raceTheme.hex).toBe('#f97316');
    expect(raceTheme.icon).toBe(Flag);
    expect(raceTheme.text).toBe('text-orange-700');

    // Goal (morning/amber)
    const goalTheme = getEventTypeTheme('morning', 'Target');
    expect(goalTheme.hex).toBe('#f59e0b');
    expect(goalTheme.icon).toBe(Target);

    // Test (day/sky)
    const testTheme = getEventTypeTheme('day', 'Trophy');
    expect(testTheme.hex).toBe('#0ea5e9');
    expect(testTheme.icon).toBe(Trophy);
  });

  it('resolves all defined EVENT_THEMES', () => {
    EVENT_THEMES.forEach((t) => {
      const theme = getEventTypeTheme(t.id);
      expect(theme.hex).toBe(t.hex);
      expect(theme.bg).toBeDefined();
      expect(theme.dot).toBeDefined();
    });
  });

  it('handles "amber" as an alias for "morning"', () => {
    const theme = getEventTypeTheme('amber');
    expect(theme.hex).toBe('#f59e0b');
    expect(theme.text).toBe('text-amber-700');
  });

  it('handles "emerald" for community theme', () => {
    const theme = getEventTypeTheme('emerald');
    expect(theme.hex).toBe('#10b981');
    expect(theme.bg).toBe('bg-emerald-50');
  });
});
