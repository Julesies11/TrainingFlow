import { describe, expect, it } from 'vitest';
import { MENU_SIDEBAR } from '../menu.config';

describe('Menu Configuration', () => {
  it('has renamed "Training Goals" to "Goals"', () => {
    const goalsItem = MENU_SIDEBAR.find(
      (item) => item.path === '/training/goals',
    );
    expect(goalsItem?.title).toBe('Goals');
  });

  it('has moved "Goals" below "Workout Library"', () => {
    const libraryIndex = MENU_SIDEBAR.findIndex(
      (item) => item.path === '/training/library',
    );
    const goalsIndex = MENU_SIDEBAR.findIndex(
      (item) => item.path === '/training/goals',
    );

    expect(libraryIndex).toBeGreaterThan(-1);
    expect(goalsIndex).toBeGreaterThan(-1);
    expect(goalsIndex).toBe(libraryIndex + 1);
  });
});
