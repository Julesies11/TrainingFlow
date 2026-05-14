import { fireEvent, render, screen } from '@/test/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Workout } from '@/types/training';
import { WorkoutDialog } from '../workout-dialog';

describe('WorkoutDialog', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();
  const mockSportTypes = [
    { id: '1', name: 'Run' },
    { id: '2', name: 'Bike' },
  ] as unknown;

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
    } as unknown as Workout;

    render(
      <WorkoutDialog
        workout={workout}
        sportTypes={mockSportTypes}
        userSettingsMap={new Map()}
        existingWorkouts={[workout]}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        isTemplateMode={true}
        totalWeeks={12}
      />,
    );

    // Find and click duplicate button
    const duplicateBtn = screen.getByRole('button', { name: /duplicate/i });
    fireEvent.click(duplicateBtn);

    // Verify duplication message
    expect(
      screen.getByText(/please select a new week\/day/i),
    ).toBeInTheDocument();

    // Verify week and day inputs are visible and have correct values
    const weekInput = screen.getByLabelText(/week number/i);
    const dayTrigger = screen.getByLabelText(/day of week/i);

    expect(weekInput).toHaveValue(2);
    expect(dayTrigger).toHaveTextContent(/wednesday/i);

    // Change values
    fireEvent.change(weekInput, { target: { value: '3' } });

    // Change day via Select
    fireEvent.click(dayTrigger);
    const fridayOption = await screen.findByRole('option', { name: /friday/i });
    fireEvent.click(fridayOption);

    // Save
    const saveBtn = screen.getByRole('button', { name: /save session/i });
    fireEvent.click(saveBtn);

    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Old Workout',
        weekNumber: 3,
        dayOfWeek: 5,
        id: undefined, // Should be undefined for new duplicate
      }),
    );
  });
});
