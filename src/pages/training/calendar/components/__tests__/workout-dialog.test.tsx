import { fireEvent, render, screen, waitFor } from '@/test/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkoutDialog } from '../workout-dialog';

describe('WorkoutDialog', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();
  const mockSportTypes = [
    { id: '1', name: 'Run' },
    { id: '2', name: 'Bike' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders week and day inputs in template mode when duplicating', async () => {
    const workout = {
      id: 'w1',
      title: 'Old Workout',
      weekNumber: 2,
      dayOfWeek: 3,
      sportTypeId: '1',
    };

    render(
      <WorkoutDialog
        workout={workout}
        sportTypes={mockSportTypes}
        userSettingsMap={new Map()}
        existingWorkouts={[workout as any]}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        isTemplateMode={true}
        totalWeeks={12}
      />
    );

    // Find and click duplicate button
    const duplicateBtn = screen.getByRole('button', { name: /duplicate/i });
    fireEvent.click(duplicateBtn);

    // Verify duplication message
    expect(screen.getByText(/please select a new week\/day/i)).toBeInTheDocument();

    // Verify week and day inputs are visible and have correct values
    const weekInput = screen.getByLabelText(/week number/i);
    const dayInput = screen.getByLabelText(/day of week/i);

    expect(weekInput).toHaveValue(2);
    expect(dayInput).toHaveValue(3);

    // Change values
    fireEvent.change(weekInput, { target: { value: '3' } });
    fireEvent.change(dayInput, { target: { value: '5' } });

    // Save
    const saveBtn = screen.getByRole('button', { name: /save session/i });
    fireEvent.click(saveBtn);

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Old Workout',
        weekNumber: 3,
        dayOfWeek: 5,
        id: undefined, // Should be undefined for new duplicate
      })
    );
  });
});
