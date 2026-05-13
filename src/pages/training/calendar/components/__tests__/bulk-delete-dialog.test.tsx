import { fireEvent, render, screen, waitFor } from '@/test/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as trainingHooks from '@/hooks/use-training-data';
import { BulkDeleteDialog } from '../bulk-delete-dialog';

// Mock hooks
vi.mock('@/hooks/use-training-data', () => ({
  useSportTypes: vi.fn(),
  useDeleteWorkoutsBulk: vi.fn(),
}));

describe('BulkDeleteDialog', () => {
  const mockOnOpenChange = vi.fn();
  const mockMutate = vi.fn();
  const mockSportTypes = [
    { id: '1', name: 'Run' },
    { id: '2', name: 'Bike' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(trainingHooks.useSportTypes).mockReturnValue({
      data: mockSportTypes,
      isLoading: false,
    } as ReturnType<typeof trainingHooks.useSportTypes>);
    vi.mocked(trainingHooks.useDeleteWorkoutsBulk).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as ReturnType<typeof trainingHooks.useDeleteWorkoutsBulk>);

    // Mock window.confirm
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  it('renders with all sports and days selected by default', async () => {
    render(<BulkDeleteDialog open={true} onOpenChange={mockOnOpenChange} />);

    // Check header
    expect(screen.getByText(/Bulk Delete Workouts/i)).toBeInTheDocument();

    // Check sports selection (all should be checked)
    const runRow = screen.getByText('Run').closest('div');
    const bikeRow = screen.getByText('Bike').closest('div');
    
    expect(runRow?.querySelector('button[role="checkbox"]')).toHaveAttribute('data-state', 'checked');
    expect(bikeRow?.querySelector('button[role="checkbox"]')).toHaveAttribute('data-state', 'checked');

    // Check days selection (7 days should be present and selected)
    // In our implementation, they are ToggleGroupItems with text M, T, W, T, F, S, S
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    days.forEach((day) => {
      const buttons = screen.getAllByText(day);
      buttons.forEach((btn) => {
        expect(btn.closest('button')).toHaveAttribute('data-state', 'on');
      });
    });
  });

  it('calls mutate with correct filters when delete is clicked', async () => {
    render(<BulkDeleteDialog open={true} onOpenChange={mockOnOpenChange} />);

    const deleteBtn = screen.getByRole('button', { name: /Delete Workouts/i });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          sportTypeIds: ['1', '2'],
          daysOfWeek: [1, 2, 3, 4, 5, 6, 7],
        }),
        expect.any(Object),
      );
    });
  });

  it('filters by selected days of week', async () => {
    render(<BulkDeleteDialog open={true} onOpenChange={mockOnOpenChange} />);

    // Deselect all days except Monday
    const days = ['T', 'W', 'T', 'F', 'S', 'S'];
    days.forEach((dayLabel) => {
      const buttons = screen.getAllByText(dayLabel);
      buttons.forEach((btn) => {
        const button = btn.closest('button');
        if (button && button.getAttribute('data-state') === 'on') {
          fireEvent.click(button);
        }
      });
    });

    const deleteBtn = screen.getByRole('button', { name: /Delete Workouts/i });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          daysOfWeek: [1], // Only Monday (value '1') remains
        }),
        expect.any(Object),
      );
    });
  });

  it('handles Select All/Deselect All for sports', async () => {
    render(<BulkDeleteDialog open={true} onOpenChange={mockOnOpenChange} />);

    const toggleAllBtn = screen.getByText(/Deselect All/i);
    fireEvent.click(toggleAllBtn);

    const runRow = screen.getByText('Run').closest('div');
    const bikeRow = screen.getByText('Bike').closest('div');
    
    expect(runRow?.querySelector('button[role="checkbox"]')).toHaveAttribute('data-state', 'unchecked');
    expect(bikeRow?.querySelector('button[role="checkbox"]')).toHaveAttribute('data-state', 'unchecked');

    fireEvent.click(screen.getByText(/Select All/i));
    expect(runRow?.querySelector('button[role="checkbox"]')).toHaveAttribute('data-state', 'checked');
    expect(bikeRow?.querySelector('button[role="checkbox"]')).toHaveAttribute('data-state', 'checked');
  });

  it('renders template mode with week inputs', async () => {
    render(
      <BulkDeleteDialog 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        isTemplateMode={true}
        totalWeeks={12}
      />
    );

    expect(screen.getByText(/Bulk Delete Template Sessions/i)).toBeInTheDocument();
    
    const fromWeekInput = screen.getByLabelText(/From Week/i);
    const toWeekInput = screen.getByLabelText(/To Week/i);
    
    expect(fromWeekInput).toHaveValue(1);
    expect(toWeekInput).toHaveValue(12);
  });

  it('calls onBulkDelete with week numbers in template mode', async () => {
    const mockOnBulkDelete = vi.fn();
    render(
      <BulkDeleteDialog 
        open={true} 
        onOpenChange={mockOnOpenChange} 
        onBulkDelete={mockOnBulkDelete}
        isTemplateMode={true}
        totalWeeks={12}
      />
    );

    const deleteBtn = screen.getByRole('button', { name: /Delete Workouts/i });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(mockOnBulkDelete).toHaveBeenCalledWith(
        '1',
        '12',
        ['1', '2'],
        [1, 2, 3, 4, 5, 6, 7]
      );
    });
  });
});
